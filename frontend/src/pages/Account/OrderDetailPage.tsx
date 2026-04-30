import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { customerApi } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";
import styles from "./Account.module.scss";

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface OrderDetail {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  items: OrderItem[];
  status: string;
  payment_status: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t, lang } = useI18n();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const r = await customerApi.get<OrderDetail>(`/account/orders/${sessionId}`);
        if (cancelled) return;
        setOrder(r.data);
        setLoading(false);
        if (r.data.payment_status === "pending") {
          timerRef.current = window.setTimeout(fetch, 3000);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId]);

  const statusClass =
    order?.payment_status === "paid"
      ? styles.statusPaid
      : order?.payment_status === "pending"
      ? styles.statusPending
      : styles.statusFailed;

  const statusLabel =
    order?.payment_status === "paid"
      ? t("account.order.paid")
      : order?.payment_status === "pending"
      ? t("account.order.pending")
      : t("account.order.failed");

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <p className={styles.empty}>…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className={styles.detailPage}>
        <Link to="/account" className={styles.detailBack}>
          {t("account.order.backToAccount")}
        </Link>
        <p className={styles.empty}>{t("account.order.notFound")}</p>
      </div>
    );
  }

  const ref = order.session_id.slice(-8).toUpperCase();
  const date = new Date(order.created_at).toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className={styles.detailPage}>
      <Link to="/account" className={styles.detailBack}>
        {t("account.order.backToAccount")}
      </Link>

      <div className={styles.detailHeader}>
        <div className={styles.detailMeta}>
          <h1>{t("account.tabs.orders")}</h1>
          <span>{t("account.order.reference")} #{ref}</span>
          <span>{date}</span>
        </div>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {order.payment_status === "pending" && (
        <div className={styles.pollingNote}>
          <span className={styles.spinner} />
          {t("checkout.pending")}
        </div>
      )}

      <table className={styles.detailItemsTable}>
        <thead>
          <tr>
            <th>{t("account.order.items")}</th>
            <th>Qté</th>
            <th>{t("account.order.total")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td>
                <div className={styles.detailItemName}>{item.name}</div>
                <div className={styles.detailItemSub}>
                  {Number(item.unit_price).toFixed(2)} {order.currency.toUpperCase()} / unité
                </div>
              </td>
              <td>× {item.quantity}</td>
              <td>{Number(item.line_total).toFixed(2)} {order.currency.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.detailTotalRow}>
        <span>{t("account.order.total")}</span>
        <span>{Number(order.amount).toFixed(2)} {order.currency.toUpperCase()}</span>
      </div>
    </div>
  );
}
