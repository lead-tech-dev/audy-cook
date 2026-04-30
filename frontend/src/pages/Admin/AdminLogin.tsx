import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import styles from "./Admin.module.scss";

export default function AdminLogin() {
  const { login } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@audycook.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      nav("/admin");
    } catch {
      setError(t("admin.invalidLogin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage} data-testid="admin-login-page">
      <div className={styles.card}>
        <span className="overline">AUDY COOK</span>
        <h1>{t("admin.login.title")}</h1>
        <form onSubmit={onSubmit}>
          <label>
            <span>{t("admin.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="admin-email-input"
            />
          </label>
          <label>
            <span>{t("admin.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="admin-password-input"
            />
          </label>
          {error && <div className={styles.err}>{error}</div>}
          <button type="submit" disabled={loading} data-testid="admin-login-submit">
            {loading ? "…" : t("admin.signIn")} →
          </button>
        </form>
      </div>
    </div>
  );
}
