import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/i18n/I18nContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { api, customerApi, whatsappLink } from "@/lib/api";
import FreeShipping from "@/components/FreeShipping/FreeShipping";
import styles from "./Cart.module.scss";

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export default function Cart() {
  const { lines, total, setQuantity, remove, clear } = useCart();
  const { t, lang } = useI18n();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      customerApi.get<SavedAddress[]>("/account/addresses").then((r) => {
        const def = r.data.find((a) => a.is_default) || r.data[0] || null;
        setDefaultAddress(def);
      }).catch(() => {});
    }
  }, [customer]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refCode, setRefCode] = useState("");
  const [refStatus, setRefStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [refDiscountPct, setRefDiscountPct] = useState(0);
  const [refOwner, setRefOwner] = useState<string>("");

  const validateRef = async () => {
    if (!refCode.trim()) return;
    try {
      const r = await api.post<{ code: string; discount_pct: number; owner_name?: string }>(
        "/referrals/validate",
        { code: refCode.trim() },
      );
      setRefStatus("valid");
      setRefDiscountPct(r.data.discount_pct);
      setRefOwner(r.data.owner_name || "");
    } catch {
      setRefStatus("invalid");
      setRefDiscountPct(0);
      setRefOwner("");
    }
  };

  const discountAmount = total * (refDiscountPct / 100);
  const finalTotal = Math.max(0, total - discountAmount);

  const handleStripe = async () => {
    if (lines.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api.post<{ url: string; session_id: string }>("/checkout/session", {
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
        origin_url: window.location.origin,
        customer_email: email || undefined,
        customer_name: name || undefined,
        customer_id: customer?.id || undefined,
        referral_code: refStatus === "valid" ? refCode.trim() : undefined,
        shipping_address: defaultAddress ? {
          full_name: defaultAddress.full_name,
          address_line1: defaultAddress.address_line1,
          address_line2: defaultAddress.address_line2,
          city: defaultAddress.city,
          postal_code: defaultAddress.postal_code,
          country: defaultAddress.country,
          phone: defaultAddress.phone,
        } : undefined,
      });
      window.location.href = r.data.url;
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          (lang === "fr"
            ? "Le paiement par carte est temporairement indisponible. Utilisez WhatsApp."
            : "Card payment is temporarily unavailable. Please use WhatsApp."),
      );
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsappMsg = () => {
    const greeting = lang === "fr"
      ? "Bonjour AUDY COOK, je souhaite passer la commande suivante :\n\n"
      : "Hello AUDY COOK, I would like to place the following order:\n\n";
    const lines_msg = lines
      .map((l) => `• ${l.product.name[lang]} × ${l.quantity} = ${(l.product.price * l.quantity).toFixed(2)} €`)
      .join("\n");
    const refLine = refStatus === "valid" ? `\nCode parrainage : ${refCode.trim()} (−${refDiscountPct}%)` : "";
    const totalLine = `\n\nTotal : ${finalTotal.toFixed(2)} €`;
    const customer = name || email ? `\n\n${name}${name && email ? " — " : ""}${email}` : "";
    return greeting + lines_msg + refLine + totalLine + customer;
  };

  return (
    <div className={styles.page} data-testid="cart-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span className="overline">{t("nav.cart")}</span>
          <h1>{t("cart.title")}</h1>
        </div>
      </header>

      <section className={styles.body}>
        {lines.length === 0 ? (
          <div className={styles.empty}>
            <p>{t("cart.empty")}</p>
            <button className={styles.btnGhost} onClick={() => navigate("/products")} data-testid="empty-continue">
              {t("cart.continue")} →
            </button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.itemsCol}>
              <ul className={styles.items}>
                {lines.map((l) => (
                  <li key={l.product.id} className={styles.item}>
                    <img src={l.product.image} alt="" />
                    <div className={styles.itemInfo}>
                      <h3>{l.product.name[lang]}</h3>
                      <p>{l.product.category[lang]}</p>
                      <div className={styles.qty}>
                        <button onClick={() => setQuantity(l.product.id, l.quantity - 1)}>−</button>
                        <span>{l.quantity}</span>
                        <button onClick={() => setQuantity(l.product.id, l.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <strong>{(l.product.price * l.quantity).toFixed(2)} €</strong>
                      <button className={styles.removeBtn} onClick={() => remove(l.product.id)}>
                        {t("cart.remove")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className={styles.clearBtn} onClick={clear} data-testid="clear-cart">
                — {lang === "fr" ? "Vider le panier" : "Clear cart"}
              </button>
            </div>

            <aside className={styles.summary}>
              <h3>{t("cart.title")}</h3>
              <FreeShipping total={total} />
              <div className={styles.row}>
                <span>{t("cart.subtotal")}</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              {refStatus === "valid" && (
                <div className={`${styles.row} ${styles.discountRow}`} data-testid="discount-row">
                  <span>{t("cart.discount")} {refOwner && `(${refOwner})`}</span>
                  <span>−{discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span>{t("cart.total")}</span>
                <span data-testid="cart-final-total">{finalTotal.toFixed(2)} €</span>
              </div>
              <p className={styles.note}>{t("cart.shippingNote")}</p>

              <div className={styles.refBlock}>
                <label className={styles.refLabel}>{t("cart.referralCode")}</label>
                <div className={styles.refRow}>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => {
                      setRefCode(e.target.value.toUpperCase());
                      setRefStatus("idle");
                    }}
                    placeholder={t("cart.referralPlaceholder")}
                    className={styles.refInput}
                    data-testid="referral-code-input"
                  />
                  <button
                    type="button"
                    className={styles.refBtn}
                    onClick={validateRef}
                    disabled={!refCode.trim()}
                    data-testid="referral-apply-btn"
                  >
                    {t("cart.referralApply")}
                  </button>
                </div>
                {refStatus === "valid" && (
                  <p className={styles.refOk} data-testid="referral-valid">✓ {t("cart.referralValid")}</p>
                )}
                {refStatus === "invalid" && (
                  <p className={styles.refKo} data-testid="referral-invalid">{t("cart.referralInvalid")}</p>
                )}
              </div>

              {defaultAddress && (
                <div className={styles.shippingBlock}>
                  <div className={styles.shippingHead}>
                    <span className={styles.shippingLabel}>{t("cart.shippingTo")}</span>
                    <Link to="/account" className={styles.shippingChange}>{t("cart.changeAddress")}</Link>
                  </div>
                  <div className={styles.shippingAddress}>
                    <strong>{defaultAddress.full_name}</strong>
                    <span>{defaultAddress.address_line1}{defaultAddress.address_line2 ? `, ${defaultAddress.address_line2}` : ""}</span>
                    <span>{defaultAddress.postal_code} {defaultAddress.city}, {defaultAddress.country}</span>
                    {defaultAddress.phone && <span>{defaultAddress.phone}</span>}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("cart.customerName")}
                className={styles.input}
                data-testid="customer-name-input"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("cart.customerEmail")}
                className={styles.input}
                data-testid="customer-email-input"
              />

              {error && <div className={styles.error}>{error}</div>}

              <button
                className={styles.btnPrimary}
                onClick={handleStripe}
                disabled={loading}
                data-testid="checkout-stripe-btn"
              >
                {loading ? "…" : `${t("cart.checkoutStripe")} →`}
              </button>
              <a
                href={whatsappLink(buildWhatsappMsg())}
                target="_blank"
                rel="noreferrer"
                className={styles.btnWhatsapp}
                data-testid="checkout-whatsapp-btn"
              >
                {t("cart.checkoutWhatsapp")} →
              </a>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
