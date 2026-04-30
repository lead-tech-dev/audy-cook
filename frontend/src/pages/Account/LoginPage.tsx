import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useI18n } from "@/i18n/I18nContext";
import styles from "./Auth.module.scss";

export default function LoginPage() {
  const { login } = useCustomerAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.overline}>AUDY COOK</span>
        <h1>{t("auth.loginTitle")}</h1>
        <form onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>{t("auth.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className={styles.field}>
            <span>{t("auth.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <div className={styles.err}>{error}</div>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "…" : `${t("auth.loginBtn")} →`}
          </button>
        </form>
        <div className={styles.footer}>
          {t("auth.noAccount")}
          <Link to="/register">{t("auth.registerBtn")}</Link>
        </div>
      </div>
    </div>
  );
}
