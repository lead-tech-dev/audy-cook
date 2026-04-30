import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useI18n } from "@/i18n/I18nContext";
import styles from "./Auth.module.scss";

export default function RegisterPage() {
  const { register } = useCustomerAuth();
  const { t } = useI18n();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      nav("/account", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.overline}>AUDY COOK</span>
        <h1>{t("auth.registerTitle")}</h1>
        <form onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>{t("auth.name")}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
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
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          {error && <div className={styles.err}>{error}</div>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "…" : `${t("auth.registerBtn")} →`}
          </button>
        </form>
        <div className={styles.footer}>
          {t("auth.alreadyAccount")}
          <Link to="/login">{t("auth.loginBtn")}</Link>
        </div>
      </div>
    </div>
  );
}
