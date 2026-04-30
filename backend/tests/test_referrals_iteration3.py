"""
Iteration 3 backend tests for AUDY COOK referral program.

Covers:
- POST /api/referrals/validate (404 on invalid code)
- POST /api/admin/referrals (auth required, creates code)
- POST /api/referrals/validate for freshly created code returns 10% + owner_name
- GET /api/admin/referrals (auth required, lists codes)
- POST /api/checkout/session with referral_code (invalid -> 400)
- POST /api/checkout/session validation (empty items, invalid product_id)
- Invariant: iteration 1 endpoints still work (products=6, admin login)
"""

import os
import re
import pytest
import requests

BASE_URL = (
    os.environ.get("REACT_APP_BACKEND_URL")
    or os.environ.get("BACKEND_URL")
    or "http://localhost:8001"
)
BASE_URL = BASE_URL.rstrip("/")

ADMIN_EMAIL = "admin@audycook.com"
ADMIN_PASSWORD = "audycook2026"


# ---------- Fixtures ----------

@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = None
    for _ in range(3):
        try:
            r = api.post(
                f"{BASE_URL}/api/admin/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=20,
            )
            break
        except requests.exceptions.RequestException:
            continue
    assert r is not None, "Admin login request failed (network)"
    assert r.status_code in (200, 201), f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def created_code(api, auth_headers):
    r = api.post(
        f"{BASE_URL}/api/admin/referrals",
        headers=auth_headers,
        json={"owner_name": "TestUser", "owner_email": "test@example.com"},
        timeout=15,
    )
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "code" in data
    return data["code"]


# ---------- Invariant: iteration-1 ----------

class TestIteration1Invariants:
    def test_products_list_six(self, api):
        r = api.get(f"{BASE_URL}/api/products", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"expected 6 products, got {len(data)}"

    def test_admin_login_still_works(self, admin_token):
        assert isinstance(admin_token, str)
        assert len(admin_token) > 20


# ---------- Referral validate (public) ----------

class TestReferralValidate:
    def test_invalid_code_returns_404(self, api):
        r = api.post(
            f"{BASE_URL}/api/referrals/validate",
            json={"code": "INVALID"},
            timeout=10,
        )
        assert r.status_code == 404, f"{r.status_code} {r.text}"
        body = r.json()
        msg = body.get("message") or body.get("error") or ""
        if isinstance(msg, list):
            msg = " ".join(map(str, msg))
        assert "invalide" in str(msg).lower() or "invalid" in str(msg).lower()

    def test_empty_string_code_returns_404_or_400(self, api):
        r = api.post(
            f"{BASE_URL}/api/referrals/validate",
            json={"code": ""},
            timeout=10,
        )
        # Empty string -> NotFound (service throws) OR 400 from validation
        assert r.status_code in (400, 404, 422)


# ---------- Admin referrals (auth required) ----------

class TestAdminReferralsAuth:
    def test_post_without_auth_returns_401(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/referrals",
            json={"owner_name": "X", "owner_email": "x@y.z"},
            timeout=10,
        )
        assert r.status_code == 401

    def test_get_without_auth_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/referrals", timeout=10)
        assert r.status_code == 401


class TestAdminReferralsCreateAndList:
    def test_create_returns_formatted_code(self, created_code):
        # Shape: AUDY-<slug up to 6 chars>-<shard 4> or AUDY-<shard 8> (fallback)
        assert isinstance(created_code, str)
        assert created_code.startswith("AUDY-")
        ok_primary = re.match(r"^AUDY-[A-Z]{1,6}-[A-Z0-9]{4}$", created_code)
        ok_fallback = re.match(r"^AUDY-[A-Z0-9]{4,8}$", created_code)
        assert ok_primary or ok_fallback, f"Unexpected code format: {created_code}"
        # Owner name 'TestUser' sluggified + capped at 6 chars -> 'TESTUS'
        assert "TESTUS" in created_code or ok_fallback

    def test_validate_freshly_created_code(self, api, created_code):
        r = api.post(
            f"{BASE_URL}/api/referrals/validate",
            json={"code": created_code},
            timeout=10,
        )
        # Nest POST may return 200 or 201
        assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
        body = r.json()
        assert body.get("code") == created_code
        assert body.get("discount_pct") == 10
        assert body.get("owner_name") == "TestUser"

    def test_validate_case_insensitive(self, api, created_code):
        r = api.post(
            f"{BASE_URL}/api/referrals/validate",
            json={"code": created_code.lower()},
            timeout=10,
        )
        assert r.status_code in (200, 201)
        assert r.json().get("code") == created_code

    def test_list_includes_created_code(self, api, auth_headers, created_code):
        r = api.get(
            f"{BASE_URL}/api/admin/referrals", headers=auth_headers, timeout=10
        )
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert isinstance(data, list)
        codes = [d.get("code") for d in data]
        assert created_code in codes
        # Verify _id stripped
        for d in data:
            assert "_id" not in d

        # Verify field shape of our created code
        mine = next(d for d in data if d.get("code") == created_code)
        assert mine.get("discount_pct") == 10
        assert mine.get("owner_name") == "TestUser"
        assert mine.get("owner_email") == "test@example.com"
        assert mine.get("active") is True
        assert mine.get("uses") == 0


# ---------- Checkout validation ----------

class TestCheckoutValidation:
    def test_empty_items_returns_400_or_422(self, api):
        r = api.post(
            f"{BASE_URL}/api/checkout/session",
            json={"items": [], "origin_url": "https://example.com"},
            timeout=15,
        )
        assert r.status_code in (400, 422), f"{r.status_code} {r.text}"

    def test_invalid_product_id_returns_400_before_stripe(self, api):
        r = api.post(
            f"{BASE_URL}/api/checkout/session",
            json={
                "items": [{"product_id": "NON_EXISTENT_XYZ", "quantity": 1}],
                "origin_url": "https://example.com",
            },
            timeout=15,
        )
        assert r.status_code == 400, f"{r.status_code} {r.text}"
        body = r.json()
        msg = body.get("message") or ""
        if isinstance(msg, list):
            msg = " ".join(map(str, msg))
        assert "not found" in str(msg).lower() or "NON_EXISTENT_XYZ" in str(msg)

    def test_invalid_referral_code_returns_400(self, api):
        # Use a real product so we pass product validation
        products = api.get(f"{BASE_URL}/api/products", timeout=10).json()
        assert products, "Need at least one product for this test"
        product_id = products[0]["id"]

        r = api.post(
            f"{BASE_URL}/api/checkout/session",
            json={
                "items": [{"product_id": product_id, "quantity": 1}],
                "origin_url": "https://example.com",
                "referral_code": "AUDY-FAKE-9999",
            },
            timeout=20,
        )
        assert r.status_code == 400, f"{r.status_code} {r.text}"
        body = r.json()
        msg = body.get("message") or ""
        if isinstance(msg, list):
            msg = " ".join(map(str, msg))
        low = str(msg).lower()
        assert "parrainage" in low or "referral" in low or "invalide" in low, (
            f"Expected referral-invalid message, got: {msg}"
        )

    def test_valid_items_no_referral_reaches_stripe(self, api):
        """
        With placeholder STRIPE_API_KEY 'sk_test_emergent', the Stripe SDK call
        will fail with 401 from Stripe, surfaced as a 5xx by Nest (or 400).
        What we verify: the endpoint ACCEPTS the payload (doesn't 400 on our
        validation) and only fails at the Stripe boundary.
        """
        products = api.get(f"{BASE_URL}/api/products", timeout=10).json()
        product_id = products[0]["id"]
        r = api.post(
            f"{BASE_URL}/api/checkout/session",
            json={
                "items": [{"product_id": product_id, "quantity": 1}],
                "origin_url": "https://example.com",
            },
            timeout=30,
        )
        # Either 200/201 (unlikely with placeholder), or Stripe-auth failure.
        # It must NOT be 400 (our validation) or 422 (schema).
        assert r.status_code not in (400, 422), (
            f"Request rejected by our validation (should have reached Stripe): "
            f"{r.status_code} {r.text}"
        )
