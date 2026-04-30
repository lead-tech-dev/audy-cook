import React from "react";
import { useI18n } from "@/i18n/I18nContext";
import styles from "./FreeShipping.module.scss";

export const FREE_SHIPPING_THRESHOLD = 50;

export default function FreeShipping({ total }: { total: number }) {
  const { lang } = useI18n();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const pct = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const reached = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className={styles.wrap} data-testid="free-shipping-banner">
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>✦</span>
        {reached ? (
          <p className={styles.msgWin}>
            {lang === "fr"
              ? "Bravo ! Livraison offerte sur cette commande."
              : "Nice! Free shipping on this order."}
          </p>
        ) : (
          <p className={styles.msg}>
            {lang === "fr" ? (
              <>
                Plus que <strong>{remaining.toFixed(2)} €</strong> pour la
                livraison offerte.
              </>
            ) : (
              <>
                Just <strong>€{remaining.toFixed(2)}</strong> away from free
                shipping.
              </>
            )}
          </p>
        )}
      </div>
      <div className={styles.bar} aria-hidden>
        <span style={{ width: `${pct}%` }} className={reached ? styles.fillWin : styles.fill} />
      </div>
    </div>
  );
}
