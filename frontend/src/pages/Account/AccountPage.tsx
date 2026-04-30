import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { customerApi } from "@/lib/api";
import styles from "./Account.module.scss";

type Tab = "info" | "orders" | "referrals" | "addresses";

interface Order {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  items: any[];
  status: string;
  payment_status: string;
  created_at: string;
}

interface ReferralCode {
  id: string;
  code: string;
  discount_pct: number;
  uses: number;
  active: boolean;
}

export default function AccountPage() {
  const { customer, logout } = useCustomerAuth();
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("info");

  const handleLogout = () => {
    logout();
    nav("/", { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.overline}>AUDY COOK</span>
          <h1>{t("account.hello")}, {customer?.name?.split(" ")[0]} 👋</h1>
          <p className={styles.email}>{customer?.email}</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          {t("auth.logout")} →
        </button>
      </div>

      <nav className={styles.tabs}>
        {(["info", "orders", "addresses", "referrals"] as Tab[]).map((v) => (
          <button
            key={v}
            className={tab === v ? styles.tabActive : ""}
            onClick={() => setTab(v)}
          >
            {t(`account.tabs.${v}` as any)}
          </button>
        ))}
      </nav>

      {tab === "info" && <InfoTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "addresses" && <AddressesTab />}
      {tab === "referrals" && <ReferralsTab />}
    </div>
  );
}

// ── Tab Infos ─────────────────────────────────────────────
function InfoTab() {
  const { customer, updateCustomer } = useCustomerAuth();
  const { t } = useI18n();

  const [name, setName] = useState(customer?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [nameErr, setNameErr] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdErr, setPwdErr] = useState("");

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameErr("");
    try {
      const r = await customerApi.patch<{ name: string; email: string }>("/account/me", { name });
      updateCustomer({ name: r.data.name });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err: any) {
      setNameErr(err?.response?.data?.message || "Erreur");
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    try {
      await customerApi.patch("/account/password", { currentPassword: curPwd, newPassword: newPwd });
      setPwdSaved(true);
      setCurPwd("");
      setNewPwd("");
      setTimeout(() => setPwdSaved(false), 2500);
    } catch (err: any) {
      setPwdErr(err?.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("account.tabs.info")}</h2>

      <form className={styles.form} onSubmit={saveName}>
        <label className={styles.field}>
          <span>{t("account.name")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn}>{t("account.save")}</button>
          {nameSaved && <span className={styles.savedMsg}>{t("account.saved")}</span>}
          {nameErr && <span className={styles.errMsg}>{nameErr}</span>}
        </div>
      </form>

      <hr className={styles.divider} />

      <form className={styles.form} onSubmit={savePassword}>
        <label className={styles.field}>
          <span>{t("account.currentPassword")}</span>
          <input
            type="password"
            value={curPwd}
            onChange={(e) => setCurPwd(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label className={styles.field}>
          <span>{t("account.newPassword")}</span>
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn}>{t("account.save")}</button>
          {pwdSaved && <span className={styles.savedMsg}>{t("account.saved")}</span>}
          {pwdErr && <span className={styles.errMsg}>{pwdErr}</span>}
        </div>
      </form>
    </div>
  );
}

// ── Tab Commandes ─────────────────────────────────────────
function OrdersTab() {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi.get<Order[]>("/account/orders")
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.empty}>…</p>;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("account.tabs.orders")}</h2>
      {orders.length === 0 ? (
        <p className={styles.empty}>{t("account.noOrders")}</p>
      ) : (
        <div className={styles.orderList}>
          {orders.map((o) => (
            <div key={o.id} className={styles.orderCard}>
              <div className={styles.orderLeft}>
                <strong>
                  {o.items.length} {t("account.orderItems")}
                </strong>
                <span>
                  {new Date(o.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
                <span className={`${styles.statusBadge} ${
                  o.payment_status === "paid" ? styles.statusPaid :
                  o.payment_status === "pending" ? styles.statusPending :
                  styles.statusFailed
                }`}>
                  {t(`account.order.${o.payment_status === "paid" ? "paid" : o.payment_status === "pending" ? "pending" : "failed"}` as any)}
                </span>
              </div>
              <div className={styles.orderRight}>
                <span className={styles.orderAmount}>
                  {Number(o.amount).toFixed(2)} {o.currency.toUpperCase()}
                </span>
                <Link to={`/account/orders/${o.session_id}`} className={styles.viewBtn}>
                  {t("account.order.viewDetail")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab Adresses ──────────────────────────────────────────
interface Address {
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

const COUNTRIES = [
  { fr: "Luxembourg",          en: "Luxembourg" },
  { fr: "Belgique",            en: "Belgium" },
  { fr: "Allemagne",           en: "Germany" },
  { fr: "Cameroun",            en: "Cameroon" },
  { fr: "Émirats Arabes Unis", en: "United Arab Emirates" },
];

const EMPTY_FORM = {
  label: "", full_name: "", address_line1: "", address_line2: "",
  city: "", postal_code: "", country: "Luxembourg", phone: "",
};

function AddressesTab() {
  const { t, lang } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await customerApi.get<Address[]>("/account/addresses");
      setAddresses(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      label: a.label, full_name: a.full_name,
      address_line1: a.address_line1, address_line2: a.address_line2 || "",
      city: a.city, postal_code: a.postal_code, country: a.country, phone: a.phone || "",
    });
    setShowForm(true);
  };

  const cancel = () => { setShowForm(false); setEditingId(null); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, address_line2: form.address_line2 || undefined, phone: form.phone || undefined };
      if (editingId) {
        await customerApi.patch(`/account/addresses/${editingId}`, payload);
      } else {
        await customerApi.post("/account/addresses", payload);
      }
      await load();
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await customerApi.delete(`/account/addresses/${id}`);
    setDeleteConfirm(null);
    await load();
  };

  const setDefault = async (id: string) => {
    await customerApi.patch(`/account/addresses/${id}/default`);
    await load();
  };

  const field = (key: keyof typeof EMPTY_FORM, label: string, opts?: { required?: boolean; type?: string }) => (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type={opts?.type || "text"}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={opts?.required !== false}
      />
    </label>
  );

  if (loading) return <p className={styles.empty}>…</p>;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeadRow}>
        <h2 className={styles.sectionTitle}>{t("account.tabs.addresses")}</h2>
        {!showForm && (
          <button className={styles.addBtn} onClick={openNew}>
            {t("account.addresses.add")}
          </button>
        )}
      </div>

      {showForm && (
        <form className={styles.addressForm} onSubmit={save}>
          <div className={styles.formGrid2}>
            {field("label", t("account.addresses.label"))}
            {field("full_name", t("account.addresses.fullName"))}
          </div>
          {field("address_line1", t("account.addresses.line1"))}
          {field("address_line2", t("account.addresses.line2"), { required: false })}
          <div className={styles.formGrid3}>
            {field("city", t("account.addresses.city"))}
            {field("postal_code", t("account.addresses.postalCode"))}
            <label className={styles.field}>
              <span>{t("account.addresses.country")}</span>
              <select
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                required
              >
                {COUNTRIES.map((c) => (
                  <option key={c.fr} value={c.fr}>
                    {lang === "fr" ? c.fr : c.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {field("phone", t("account.addresses.phone"), { required: false, type: "tel" })}
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "…" : t("account.addresses.saveAddress")}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={cancel}>
              {t("account.addresses.cancel")}
            </button>
          </div>
        </form>
      )}

      {!showForm && addresses.length === 0 && (
        <p className={styles.empty}>{t("account.addresses.noAddresses")}</p>
      )}

      {!showForm && (
        <div className={styles.addressList}>
          {addresses.map((a) => (
            <div key={a.id} className={`${styles.addressCard} ${a.is_default ? styles.addressCardDefault : ""}`}>
              <div className={styles.addressTop}>
                <span className={styles.addressLabel}>{a.label}</span>
                {a.is_default && (
                  <span className={styles.addressBadge}>{t("account.addresses.default")}</span>
                )}
              </div>
              <div className={styles.addressDetails}>
                <strong>{a.full_name}</strong>
                <span>{a.address_line1}</span>
                {a.address_line2 && <span>{a.address_line2}</span>}
                <span>{a.postal_code} {a.city}</span>
                <span>{a.country}</span>
                {a.phone && <span>{a.phone}</span>}
              </div>
              <div className={styles.addressActions}>
                {!a.is_default && (
                  <button className={styles.addressActionBtn} onClick={() => setDefault(a.id)}>
                    {t("account.addresses.setDefault")}
                  </button>
                )}
                <button className={styles.addressActionBtn} onClick={() => openEdit(a)}>
                  {t("account.addresses.edit")}
                </button>
                {deleteConfirm === a.id ? (
                  <>
                    <button className={`${styles.addressActionBtn} ${styles.addressDeleteConfirm}`} onClick={() => remove(a.id)}>
                      {t("account.addresses.confirmDelete")}
                    </button>
                    <button className={styles.addressActionBtn} onClick={() => setDeleteConfirm(null)}>
                      {t("account.addresses.cancel")}
                    </button>
                  </>
                ) : (
                  <button className={`${styles.addressActionBtn} ${styles.addressDeleteBtn}`} onClick={() => setDeleteConfirm(a.id)}>
                    {t("account.addresses.delete")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab Parrainage ────────────────────────────────────────
interface Saving {
  session_id: string;
  referral_code_used: string;
  discount_pct: number;
  discount_amount: number;
  order_amount: number;
  created_at: string;
}

function ReferralsTab() {
  const { t, lang } = useI18n();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      customerApi.get<ReferralCode[]>("/account/referrals"),
      customerApi.get<Saving[]>("/account/referral-savings"),
    ]).then(([codesRes, savingsRes]) => {
      setCodes(codesRes.data);
      setSavings(savingsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* noop */ }
  };

  const shareWhatsapp = (code: string) => {
    const msg = lang === "fr"
      ? `Utilise mon code parrainage AUDY COOK : ${code} — tu bénéficies de −10% sur ta commande ! 🌶️`
      : `Use my AUDY COOK referral code: ${code} — get −10% off your order! 🌶️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <p className={styles.empty}>…</p>;

  const primaryCode = codes.find((c) => c.active) ?? codes[0] ?? null;
  const otherCodes = codes.filter((c) => c !== primaryCode);
  const totalUses = codes.reduce((acc, c) => acc + (c.uses || 0), 0);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("account.tabs.referrals")}</h2>

      {/* ── Hero code block ── */}
      {!primaryCode ? (
        <p className={styles.empty}>{t("account.referral.noCode")}</p>
      ) : (
        <div className={styles.referralHero}>
          <p className={styles.referralHeroLabel}>{t("account.referral.yourCode")}</p>
          <div className={styles.referralCodeRow}>
            <span className={styles.referralCode}>{primaryCode.code}</span>
            <button
              className={styles.referralCopyBtn}
              onClick={() => copy(primaryCode.code)}
            >
              {copied === primaryCode.code ? t("account.codeCopied") : t("account.copyCode")}
            </button>
          </div>
          <p className={styles.referralHowItWorks}>{t("account.referral.howItWorks")}</p>
          <div className={styles.referralActions}>
            <button className={styles.referralShareBtn} onClick={() => shareWhatsapp(primaryCode.code)}>
              {t("account.referral.share")} →
            </button>
          </div>
          {totalUses > 0 && (
            <div className={styles.referralStats}>
              🎉 <strong>{totalUses}</strong> {t("account.referral.friendsCount")}
            </div>
          )}
        </div>
      )}

      {/* ── Other codes ── */}
      {otherCodes.length > 0 && (
        <>
          <h3 className={styles.subSectionTitle}>{t("account.referral.otherCodes")}</h3>
          <div className={styles.codeList}>
            {otherCodes.map((c) => (
              <div key={c.id} className={styles.codeCard}>
                <div>
                  <div className={styles.codeValue}>
                    {c.code}
                    {!c.active && <span className={styles.inactiveBadge}>{t("account.referral.inactive")}</span>}
                  </div>
                  <div className={styles.codeUses}>−{c.discount_pct}% · {c.uses} {t("account.codeUses")}</div>
                </div>
                <button className={styles.copyBtn} onClick={() => copy(c.code)}>
                  {copied === c.code ? t("account.codeCopied") : t("account.copyCode")}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Savings history ── */}
      <h3 className={styles.subSectionTitle}>{t("account.referral.savingsTitle")}</h3>
      {savings.length === 0 ? (
        <p className={styles.empty}>{t("account.referral.noSavings")}</p>
      ) : (
        <div className={styles.savingsList}>
          {savings.map((s) => (
            <div key={s.session_id} className={styles.savingCard}>
              <div className={styles.savingLeft}>
                <span className={styles.savingCode}>{s.referral_code_used}</span>
                <span className={styles.savingDate}>
                  {new Date(s.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
              <span className={styles.savingAmount}>
                −{s.discount_amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
