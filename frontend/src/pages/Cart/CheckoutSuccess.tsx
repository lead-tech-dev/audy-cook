import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { api, whatsappLink } from "@/lib/api";
import styles from "./CheckoutSuccess.module.scss";

type Status = "checking" | "success" | "failed";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { t, lang } = useI18n();
  const { clear } = useCart();
  const [status, setStatus] = useState<Status>("checking");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const attempts = useRef(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    let timeout: any;
    const poll = async () => {
      try {
        const r = await api.get<{ payment_status: string; status: string; generated_referral_code?: string | null }>(
          `/checkout/status/${sessionId}`,
        );
        if (r.data.payment_status === "paid") {
          setStatus("success");
          if (r.data.generated_referral_code) setReferralCode(r.data.generated_referral_code);
          if (!cleared.current) {
            clear();
            cleared.current = true;
          }
          return;
        }
        if (r.data.status === "expired") {
          setStatus("failed");
          return;
        }
      } catch (e) {
        // ignore transient
      }
      attempts.current += 1;
      if (attempts.current >= 6) {
        setStatus("failed");
        return;
      }
      timeout = setTimeout(poll, 2000);
    };
    poll();
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const onCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const shareMessage =
    lang === "fr"
      ? `Hey ! J'ai commandé chez AUDY COOK et c'était super. Tiens, voilà mon code parrainage qui te donne −10% : ${referralCode} — bonne dégustation !`
      : `Hey! I ordered from AUDY COOK and it was amazing. Here's my referral code for −10%: ${referralCode} — enjoy!`;

  return (
    <div className={styles.page} data-testid="checkout-success-page">
      <div className={styles.inner}>
        {status === "checking" && (
          <>
            <div className={styles.spinner} />
            <h1>{t("checkout.pending")}</h1>
          </>
        )}
        {status === "success" && (
          <>
            <span className={styles.icon}>✓</span>
            <h1>{t("checkout.success.title")}</h1>
            <p>{t("checkout.success.body")}</p>

            {referralCode && (
              <div className={styles.refBox} data-testid="referral-card">
                <span className={styles.refOverline}>{t("checkout.referral.title")}</span>
                <div className={styles.refCode} data-testid="generated-referral-code">
                  {referralCode}
                </div>
                <p className={styles.refBody}>{t("checkout.referral.body")}</p>
                <div className={styles.refActions}>
                  <button onClick={onCopy} className={styles.refCopy} data-testid="copy-referral">
                    {copied ? t("checkout.referral.copied") : t("checkout.referral.copy")}
                  </button>
                  <a
                    href={whatsappLink(shareMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.refShare}
                    data-testid="share-referral"
                  >
                    {t("checkout.referral.share")} →
                  </a>
                </div>
              </div>
            )}

            <Link to="/" className={styles.btn}>
              {t("checkout.backHome")} →
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <span className={styles.iconFail}>×</span>
            <h1>{t("checkout.failed")}</h1>
            <Link to="/cart" className={styles.btn}>
              {t("nav.cart")} →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
