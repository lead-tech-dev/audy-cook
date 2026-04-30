"""AUDY COOK NestJS backend regression tests.

Covers: products, products by slug, menu, blog (list + by slug), resellers,
whatsapp, admin login (success + 401 + validation), admin/me (with/without
token), full admin CRUD for products / blog / menu, and checkout input
validation (does NOT require Stripe success — placeholder Stripe key).
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@audycook.com"
ADMIN_PASSWORD = "audycook2026"

TIMEOUT = 30


# --- fixtures -----------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                     timeout=TIMEOUT)
    assert r.status_code == 201 or r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str) and data["access_token"]
    return data["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- public products ----------------------------------------------------------
class TestProducts:
    def test_list_products(self, session):
        r = session.get(f"{API}/products", timeout=TIMEOUT)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6, f"expected >=6 seeded products, got {len(items)}"
        first = items[0]
        for k in ("slug", "name", "description", "category", "price", "image"):
            assert k in first, f"missing field {k}"
        # _id must NOT be leaked
        for it in items:
            assert "_id" not in it, "MongoDB _id leaked in products list"
        # badge field present (may be null)
        assert "badge" in first

    def test_product_by_slug(self, session):
        r = session.get(f"{API}/products/farine-mais-audycook", timeout=TIMEOUT)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "farine-mais-audycook"
        assert "_id" not in p
        assert p["price"] == 12.0 or p["price"] == 12

    def test_product_unknown_slug_404(self, session):
        r = session.get(f"{API}/products/does-not-exist-zzz", timeout=TIMEOUT)
        assert r.status_code == 404


# --- public menu --------------------------------------------------------------
class TestMenu:
    def test_list_menu(self, session):
        r = session.get(f"{API}/menu", timeout=TIMEOUT)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 5
        for it in items:
            assert "_id" not in it
            assert "name" in it and "price" in it


# --- public blog --------------------------------------------------------------
class TestBlog:
    def test_list_blog(self, session):
        r = session.get(f"{API}/blog", timeout=TIMEOUT)
        assert r.status_code == 200
        posts = r.json()
        assert isinstance(posts, list) and len(posts) >= 3
        for p in posts:
            assert "_id" not in p
            assert "slug" in p and "title" in p

    def test_blog_by_slug(self, session):
        r = session.get(f"{API}/blog/secrets-ndole-authentique", timeout=TIMEOUT)
        assert r.status_code == 200
        post = r.json()
        assert post["slug"] == "secrets-ndole-authentique"
        assert "_id" not in post

    def test_blog_unknown_slug_404(self, session):
        r = session.get(f"{API}/blog/no-such-post", timeout=TIMEOUT)
        assert r.status_code == 404


# --- resellers / whatsapp -----------------------------------------------------
class TestStatic:
    def test_resellers(self, session):
        r = session.get(f"{API}/resellers", timeout=TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        # Accept either {countries:[...]} or list of countries
        countries = data["countries"] if isinstance(data, dict) and "countries" in data else data
        assert isinstance(countries, list) and len(countries) >= 1

    def test_whatsapp(self, session):
        r = session.get(f"{API}/whatsapp", timeout=TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        # Accept {number: "..."} or {whatsapp: "..."} or raw string
        num = data.get("number") if isinstance(data, dict) else None
        assert num or isinstance(data, dict), f"unexpected whatsapp payload: {data}"


# --- auth ---------------------------------------------------------------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/admin/login",
                         json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                         timeout=TIMEOUT)
        assert r.status_code in (200, 201)
        d = r.json()
        assert d.get("access_token")
        assert d.get("email") == ADMIN_EMAIL

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/admin/login",
                         json={"email": ADMIN_EMAIL, "password": "wrongwrong"},
                         timeout=TIMEOUT)
        assert r.status_code == 401

    def test_login_validation_missing_fields(self, session):
        r = session.post(f"{API}/admin/login", json={}, timeout=TIMEOUT)
        assert r.status_code in (400, 422)

    def test_login_invalid_email_format(self, session):
        r = session.post(f"{API}/admin/login",
                         json={"email": "not-an-email", "password": "audycook2026"},
                         timeout=TIMEOUT)
        assert r.status_code in (400, 422)

    def test_me_without_token(self, session):
        r = session.get(f"{API}/admin/me", timeout=TIMEOUT)
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/admin/me", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("email") == ADMIN_EMAIL


# --- admin CRUD: products -----------------------------------------------------
class TestAdminProducts:
    def test_product_full_crud(self, session, auth_headers):
        slug = f"test-product-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "name": {"fr": "Produit TEST", "en": "TEST product"},
            "description": {"fr": "desc fr", "en": "desc en"},
            "category": {"fr": "TEST", "en": "TEST"},
            "price": 9.99,
            "image": "https://example.com/img.jpg",
            "badge": "test",
            "in_stock": True,
            "sort_order": 99,
        }
        # CREATE
        r = session.post(f"{API}/admin/products", json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"create: {r.status_code} {r.text}"
        created = r.json()
        assert created["slug"] == slug
        assert "_id" not in created
        pid = created.get("id") or created.get("_id")
        assert pid, f"no id returned: {created}"

        # Verify via public GET by slug
        rg = session.get(f"{API}/products/{slug}", timeout=TIMEOUT)
        assert rg.status_code == 200
        assert rg.json()["price"] == 9.99

        # UPDATE
        upd = dict(payload)
        upd["price"] = 14.5
        upd["name"] = {"fr": "Produit TEST modifie", "en": "TEST updated"}
        r = session.put(f"{API}/admin/products/{pid}", json=upd, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"update: {r.status_code} {r.text}"
        u = r.json()
        assert u["price"] == 14.5
        assert u["name"]["en"] == "TEST updated"

        # Verify persistence
        rg = session.get(f"{API}/products/{slug}", timeout=TIMEOUT)
        assert rg.status_code == 200 and rg.json()["price"] == 14.5

        # DELETE
        r = session.delete(f"{API}/admin/products/{pid}", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 204)

        # Verify gone
        rg = session.get(f"{API}/products/{slug}", timeout=TIMEOUT)
        assert rg.status_code == 404

    def test_create_product_requires_auth(self, session):
        r = session.post(f"{API}/admin/products", json={"slug": "x"}, timeout=TIMEOUT)
        assert r.status_code == 401


# --- admin CRUD: blog ---------------------------------------------------------
class TestAdminBlog:
    def test_blog_full_crud(self, session, auth_headers):
        slug = f"test-post-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "title": {"fr": "Test FR", "en": "Test EN"},
            "excerpt": {"fr": "ex fr", "en": "ex en"},
            "body": {"fr": "body fr", "en": "body en"},
            "cover_image": "https://example.com/c.jpg",
            "category": {"fr": "TEST", "en": "TEST"},
            "read_time": 3,
        }
        r = session.post(f"{API}/admin/blog", json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"create: {r.status_code} {r.text}"
        created = r.json()
        pid = created.get("id") or created.get("_id")
        assert pid

        # Update
        upd = dict(payload, read_time=10)
        r = session.put(f"{API}/admin/blog/{pid}", json=upd, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["read_time"] == 10

        # Delete
        r = session.delete(f"{API}/admin/blog/{pid}", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 204)

        rg = session.get(f"{API}/blog/{slug}", timeout=TIMEOUT)
        assert rg.status_code == 404

    def test_create_blog_requires_auth(self, session):
        r = session.post(f"{API}/admin/blog", json={"slug": "x"}, timeout=TIMEOUT)
        assert r.status_code == 401


# --- admin CRUD: menu ---------------------------------------------------------
class TestAdminMenu:
    def test_menu_full_crud(self, session, auth_headers):
        payload = {
            "name": {"fr": "Plat TEST", "en": "TEST dish"},
            "description": {"fr": "d fr", "en": "d en"},
            "price": 22.5,
            "min_quantity": 5,
            "sort_order": 99,
        }
        r = session.post(f"{API}/admin/menu", json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"create: {r.status_code} {r.text}"
        created = r.json()
        pid = created.get("id") or created.get("_id")
        assert pid

        # Update
        upd = dict(payload, price=33.0)
        r = session.put(f"{API}/admin/menu/{pid}", json=upd, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["price"] == 33.0

        # Delete
        r = session.delete(f"{API}/admin/menu/{pid}", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 204)

    def test_create_menu_requires_auth(self, session):
        r = session.post(f"{API}/admin/menu", json={}, timeout=TIMEOUT)
        assert r.status_code == 401


# --- checkout (validation only — Stripe key is placeholder) -------------------
class TestCheckout:
    def test_empty_items_rejected(self, session):
        r = session.post(f"{API}/checkout/session",
                         json={"items": [], "origin_url": "https://example.com"},
                         timeout=TIMEOUT)
        assert r.status_code in (400, 422), f"expected 4xx for empty items, got {r.status_code} {r.text}"

    def test_missing_origin_url_rejected(self, session):
        r = session.post(f"{API}/checkout/session",
                         json={"items": [{"product_id": "abc", "quantity": 1}]},
                         timeout=TIMEOUT)
        assert r.status_code in (400, 422)

    def test_invalid_product_id_rejected(self, session):
        # product_id that is not in DB → BadRequestException 400
        r = session.post(f"{API}/checkout/session",
                         json={"items": [{"product_id": "nonexistent-id-zzz", "quantity": 1}],
                               "origin_url": "https://example.com"},
                         timeout=TIMEOUT)
        assert r.status_code == 400, f"expected 400 for unknown product, got {r.status_code} {r.text}"

    def test_invalid_quantity_rejected(self, session):
        r = session.post(f"{API}/checkout/session",
                         json={"items": [{"product_id": "abc", "quantity": 0}],
                               "origin_url": "https://example.com"},
                         timeout=TIMEOUT)
        assert r.status_code in (400, 422)
