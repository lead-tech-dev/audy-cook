import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { whatsappLink } from "@/lib/api";
import styles from "./Footer.module.scss";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer} data-testid="site-footer">
      <div className={styles.inner}>
        <div className={styles.col}>
          <img
            src="/brand/audycook-logo.png"
            alt="AUDY COOK"
            className={styles.brandImg}
          />
          <p className={styles.tagline}>{t("footer.tagline")}</p>
          <p className={styles.expansion}>{t("footer.expansion")}</p>
        </div>

        <div className={styles.col}>
          <h4>{t("footer.contact")}</h4>
          <a
            href={whatsappLink("Bonjour AUDY COOK, j'aimerais avoir des informations sur vos produits.")}
            target="_blank"
            rel="noreferrer"
            className={styles.bigPhone}
            data-testid="whatsapp-contact-link"
          >
            +352 66 12 99 974
          </a>
          <p className={styles.muted}>WhatsApp · 24/7</p>
          <Link to="/admin/login" className={styles.adminLink} data-testid="admin-login-link">
            Admin
          </Link>
        </div>

        <div className={styles.col}>
          <h4>{t("footer.hours")}</h4>
          <p>{t("footer.hours1")}</p>
          <p>{t("footer.hours2")}</p>
          <p>{t("footer.hours3")}</p>
        </div>

        <div className={styles.col}>
          <h4>Pages</h4>
          <Link to="/products">{t("nav.products")}</Link>
          <Link to="/menu">{t("nav.menu")}</Link>
          <Link to="/catering">{t("nav.catering")}</Link>
          <Link to="/resellers">{t("nav.resellers")}</Link>
          <Link to="/blog">{t("nav.blog")}</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} AUDY COOK</span>
        <span>{t("footer.rights")}</span>
      </div>
    </footer>
  );
}
