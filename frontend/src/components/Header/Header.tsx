import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Header.module.scss";

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const { count, setDrawerOpen } = useCart();
  const { isLoggedIn, customer } = useCustomerAuth();
  const { isAuthed, email: adminEmail } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", key: "nav.home" as const },
    { to: "/products", key: "nav.products" as const },
    { to: "/menu", key: "nav.menu" as const },
    { to: "/catering", key: "nav.catering" as const },
    { to: "/resellers", key: "nav.resellers" as const },
    { to: "/blog", key: "nav.blog" as const },
  ];

  return (
    <header className={styles.header} data-testid="site-header">
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} data-testid="brand-logo" aria-label="AUDY COOK">
          <img
            src="/brand/audycook-logo.png"
            alt="AUDY COOK – Repas camerounais au Luxembourg"
            className={styles.brandImg}
          />
        </Link>

        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              data-testid={`nav-link-${l.to.replace("/", "") || "home"}`}
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <select
            className={styles.langSelect}
            value={lang}
            onChange={(e) => setLang(e.target.value as "fr" | "en")}
            data-testid="language-switcher"
            aria-label="Language"
          >
            <option value="fr" data-testid="lang-fr">FR</option>
            <option value="en" data-testid="lang-en">EN</option>
          </select>
          <Link
            to={isLoggedIn ? "/account" : isAuthed ? "/admin" : "/login"}
            className={styles.accountBtn}
            data-testid="account-link"
          >
            {isLoggedIn
              ? (customer?.name?.split(" ")[0] ?? t("nav.account"))
              : isAuthed
              ? (adminEmail?.split("@")[0] ?? "Admin")
              : t("nav.login")}
          </Link>
          <button
            className={styles.cartBtn}
            onClick={() => setDrawerOpen(true)}
            data-testid="open-cart-btn"
            aria-label="Open cart"
          >
            <span>{t("nav.cart")}</span>
            {count > 0 && (
              <span className={styles.cartCount} data-testid="cart-count">
                {count}
              </span>
            )}
          </button>
          <button
            className={styles.burger}
            onClick={() => setMobileOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu} data-testid="mobile-menu">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={styles.mobileLink}>
              {t(l.key)}
            </Link>
          ))}
          <Link to={isLoggedIn ? "/account" : isAuthed ? "/admin" : "/login"} className={styles.mobileLink}>
            {isLoggedIn ? t("nav.account") : isAuthed ? (adminEmail?.split("@")[0] ?? "Admin") : t("nav.login")}
          </Link>
        </div>
      )}
    </header>
  );
}
