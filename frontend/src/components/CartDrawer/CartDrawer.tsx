import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/i18n/I18nContext";
import { useNavigate } from "react-router-dom";
import FreeShipping from "@/components/FreeShipping/FreeShipping";
import styles from "./CartDrawer.module.scss";

export default function CartDrawer() {
  const { lines, total, drawerOpen, setDrawerOpen, setQuantity, remove } = useCart();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`${styles.backdrop} ${drawerOpen ? styles.open : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.open : ""}`}
        data-testid="cart-drawer"
      >
        <div className={styles.head}>
          <h3>{t("cart.title")}</h3>
          <button
            className={styles.closeBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
            data-testid="close-cart-btn"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className={styles.empty} data-testid="cart-empty">
            <p>{t("cart.empty")}</p>
            <button
              className={styles.continue}
              onClick={() => {
                setDrawerOpen(false);
                navigate("/products");
              }}
              data-testid="continue-shopping-btn"
            >
              {t("cart.continue")}
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.lines}>
              {lines.map((l) => (
                <li key={l.product.id} className={styles.line} data-testid={`cart-line-${l.product.slug}`}>
                  <img src={l.product.image} alt="" />
                  <div className={styles.lineInfo}>
                    <h4>{l.product.name[lang]}</h4>
                    <p className={styles.price}>{(l.product.price * l.quantity).toFixed(2)} €</p>
                    <div className={styles.qty}>
                      <button
                        onClick={() => setQuantity(l.product.id, l.quantity - 1)}
                        data-testid={`qty-minus-${l.product.slug}`}
                      >−</button>
                      <span>{l.quantity}</span>
                      <button
                        onClick={() => setQuantity(l.product.id, l.quantity + 1)}
                        data-testid={`qty-plus-${l.product.slug}`}
                      >+</button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => remove(l.product.id)}
                    data-testid={`remove-${l.product.slug}`}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.foot}>
              <div className={styles.shipWrap}>
                <FreeShipping total={total} />
              </div>
              <div className={styles.totalRow}>
                <span>{t("cart.total")}</span>
                <span className={styles.totalAmount} data-testid="cart-total">
                  {total.toFixed(2)} €
                </span>
              </div>
              <button
                className={styles.checkoutBtn}
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/cart");
                }}
                data-testid="goto-checkout-btn"
              >
                {t("cart.checkoutStripe")} →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
