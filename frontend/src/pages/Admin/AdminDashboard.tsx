import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { Product, BlogPost, MenuItem } from "@/types";
import { useNavigate } from "react-router-dom";
import styles from "./Admin.module.scss";
import RichEditor from "@/components/RichEditor/RichEditor";

type Tab = "products" | "menu" | "blog" | "referrals" | "customers";

export default function AdminDashboard() {
  const { email, logout } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className={styles.page} data-testid="admin-dashboard">
      <header className={styles.head}>
        <div>
          <span className="overline">AUDY COOK · admin</span>
          <h1>{t("admin.dashboard")}</h1>
          <p className={styles.muted}>{email}</p>
        </div>
        <button
          className={styles.signOut}
          onClick={() => {
            logout();
            nav("/");
          }}
          data-testid="admin-logout"
        >
          {t("admin.signOut")} →
        </button>
      </header>

      <nav className={styles.tabs}>
        {(["products", "menu", "blog", "referrals", "customers"] as Tab[]).map((v) => (
          <button
            key={v}
            className={tab === v ? styles.tabActive : ""}
            onClick={() => setTab(v)}
            data-testid={`admin-tab-${v}`}
          >
            {t(`admin.${v}` as any)}
          </button>
        ))}
      </nav>

      <section className={styles.content}>
        {tab === "products" && <ProductsAdmin />}
        {tab === "menu" && <MenuAdmin />}
        {tab === "blog" && <BlogAdmin />}
        {tab === "referrals" && <ReferralsAdmin />}
        {tab === "customers" && <CustomersAdmin />}
      </section>
    </div>
  );
}

// ---------------- Products admin ----------------
function ProductsAdmin() {
  const { t } = useI18n();
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => api.get<Product[]>("/products").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const empty: Partial<Product> = {
    slug: "",
    name: { fr: "", en: "" },
    description: { fr: "", en: "" },
    category: { fr: "", en: "" },
    price: 0,
    image: "",
    badge: null,
    in_stock: true,
    sort_order: 0,
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>{t("admin.products")}</h2>
        <button
          className={styles.add}
          onClick={() => { setCreating(true); setEditing(empty as Product); }}
          data-testid="admin-add-product"
        >
          + {t("admin.add")}
        </button>
      </div>
      <div className={styles.list}>
        {list.map((p) => (
          <div key={p.id} className={styles.row}>
            <img src={p.image} alt="" />
            <div className={styles.rowInfo}>
              <strong>{p.name.fr}</strong>
              <span>{p.slug}</span>
            </div>
            <span className={styles.price}>{p.price.toFixed(2)} €</span>
            <button onClick={() => { setCreating(false); setEditing(p); }} data-testid={`edit-product-${p.slug}`}>
              {t("admin.edit")}
            </button>
            <button
              className={styles.del}
              onClick={async () => {
                if (!window.confirm(t("admin.confirmDelete"))) return;
                await api.delete(`/admin/products/${p.id}`);
                load();
              }}
              data-testid={`delete-product-${p.slug}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <ProductForm
          initial={editing}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={async (data) => {
            if (creating) {
              await api.post("/admin/products", data);
            } else {
              await api.put(`/admin/products/${editing.id}`, data);
            }
            await load();
            setEditing(null); setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await api.post<{ url: string }>("/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(r.data.url);
    } catch {
      setError("Échec de l'upload. Réessayez.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.formField}>
      <span>Image</span>
      <div className={styles.imageUploadArea}>
        {value && (
          <img src={value} alt="preview" className={styles.imagePreview} />
        )}
        <div className={styles.imageUploadRow}>
          <input
            type="text"
            placeholder="URL ou uploader ci-dessous"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "…" : "📁 Choisir"}
          </button>
        </div>
        {error && <span className={styles.uploadError}>{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

function ProductForm({
  initial, isNew, onClose, onSave,
}: { initial: Product; isNew: boolean; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const { t } = useI18n();
  const [data, setData] = useState<any>(initial);
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? t("admin.add") : t("admin.edit")}</h3>
        <Input label="Slug" value={data.slug} onChange={(v) => setData({ ...data, slug: v })} />
        <Input label="Nom (FR)" value={data.name?.fr || ""} onChange={(v) => setData({ ...data, name: { ...data.name, fr: v } })} />
        <Input label="Name (EN)" value={data.name?.en || ""} onChange={(v) => setData({ ...data, name: { ...data.name, en: v } })} />
        <Textarea label="Description (FR)" value={data.description?.fr || ""} onChange={(v) => setData({ ...data, description: { ...data.description, fr: v } })} />
        <Textarea label="Description (EN)" value={data.description?.en || ""} onChange={(v) => setData({ ...data, description: { ...data.description, en: v } })} />
        <Input label="Catégorie (FR)" value={data.category?.fr || ""} onChange={(v) => setData({ ...data, category: { ...data.category, fr: v } })} />
        <Input label="Category (EN)" value={data.category?.en || ""} onChange={(v) => setData({ ...data, category: { ...data.category, en: v } })} />
        <Input label="Prix (€)" type="number" value={String(data.price ?? 0)} onChange={(v) => setData({ ...data, price: parseFloat(v) || 0 })} />
        <ImageUpload value={data.image || ""} onChange={(url) => setData({ ...data, image: url })} />
        <Input label="Badge (bestseller / new / vide)" value={data.badge || ""} onChange={(v) => setData({ ...data, badge: v || null })} />
        <div className={styles.modalActions}>
          <button onClick={onClose}>{t("admin.cancel")}</button>
          <button className={styles.save} onClick={() => onSave(data)} data-testid="admin-save-product">
            {t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Menu admin ----------------
function MenuAdmin() {
  const { t } = useI18n();
  const [list, setList] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => api.get<MenuItem[]>("/menu").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const empty: any = {
    name: { fr: "", en: "" },
    description: { fr: "", en: "" },
    price: 0, min_quantity: 5, sort_order: 0,
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>{t("admin.menu")}</h2>
        <button className={styles.add} onClick={() => { setCreating(true); setEditing(empty); }}>
          + {t("admin.add")}
        </button>
      </div>
      <div className={styles.list}>
        {list.map((m) => (
          <div key={m.id} className={`${styles.row} ${styles.rowNoImg}`}>
            <div className={styles.rowInfo}>
              <strong>{m.name.fr}</strong>
              <span>{m.description.fr}</span>
            </div>
            <span className={styles.price}>{m.price.toFixed(2)} €</span>
            <button onClick={() => { setCreating(false); setEditing(m); }}>{t("admin.edit")}</button>
            <button
              className={styles.del}
              onClick={async () => {
                if (!window.confirm(t("admin.confirmDelete"))) return;
                await api.delete(`/admin/menu/${m.id}`);
                load();
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {editing && (
        <div className={styles.modalBackdrop} onClick={() => { setEditing(null); setCreating(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{creating ? t("admin.add") : t("admin.edit")}</h3>
            <Input label="Nom (FR)" value={editing.name?.fr || ""} onChange={(v) => setEditing({ ...editing, name: { ...editing.name, fr: v } } as any)} />
            <Input label="Name (EN)" value={editing.name?.en || ""} onChange={(v) => setEditing({ ...editing, name: { ...editing.name, en: v } } as any)} />
            <Input label="Description (FR)" value={editing.description?.fr || ""} onChange={(v) => setEditing({ ...editing, description: { ...editing.description, fr: v } } as any)} />
            <Input label="Description (EN)" value={editing.description?.en || ""} onChange={(v) => setEditing({ ...editing, description: { ...editing.description, en: v } } as any)} />
            <Input label="Prix (€)" type="number" value={String(editing.price)} onChange={(v) => setEditing({ ...editing, price: parseFloat(v) || 0 })} />
            <Input label="Min. quantité" type="number" value={String(editing.min_quantity)} onChange={(v) => setEditing({ ...editing, min_quantity: parseInt(v) || 1 })} />
            <div className={styles.modalActions}>
              <button onClick={() => { setEditing(null); setCreating(false); }}>{t("admin.cancel")}</button>
              <button
                className={styles.save}
                onClick={async () => {
                  if (creating) await api.post("/admin/menu", editing);
                  else await api.put(`/admin/menu/${editing.id}`, editing);
                  await load();
                  setEditing(null); setCreating(false);
                }}
              >
                {t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Blog admin ----------------
function BlogAdmin() {
  const { t } = useI18n();
  const [list, setList] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => api.get<BlogPost[]>("/blog").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const empty: any = {
    slug: "",
    title: { fr: "", en: "" }, excerpt: { fr: "", en: "" }, body: { fr: "", en: "" },
    cover_image: "", category: { fr: "", en: "" }, read_time: 5,
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>{t("admin.blog")}</h2>
        <button className={styles.add} onClick={() => { setCreating(true); setEditing(empty); }}>
          + {t("admin.add")}
        </button>
      </div>
      <div className={styles.list}>
        {list.map((p) => (
          <div key={p.id} className={styles.row}>
            <img src={p.cover_image} alt="" />
            <div className={styles.rowInfo}>
              <strong>{p.title.fr}</strong>
              <span>{p.slug}</span>
            </div>
            <button onClick={() => { setCreating(false); setEditing(p); }}>{t("admin.edit")}</button>
            <button
              className={styles.del}
              onClick={async () => {
                if (!window.confirm(t("admin.confirmDelete"))) return;
                await api.delete(`/admin/blog/${p.id}`);
                load();
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {editing && (
        <div className={styles.modalBackdrop} onClick={() => { setEditing(null); setCreating(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{creating ? t("admin.add") : t("admin.edit")}</h3>
            <Input label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v } as any)} />
            <Input label="Titre (FR)" value={editing.title?.fr || ""} onChange={(v) => setEditing({ ...editing, title: { ...editing.title, fr: v } } as any)} />
            <Input label="Title (EN)" value={editing.title?.en || ""} onChange={(v) => setEditing({ ...editing, title: { ...editing.title, en: v } } as any)} />
            <Input label="Image URL" value={editing.cover_image} onChange={(v) => setEditing({ ...editing, cover_image: v } as any)} />
            <Input label="Catégorie (FR)" value={editing.category?.fr || ""} onChange={(v) => setEditing({ ...editing, category: { ...editing.category, fr: v } } as any)} />
            <Input label="Category (EN)" value={editing.category?.en || ""} onChange={(v) => setEditing({ ...editing, category: { ...editing.category, en: v } } as any)} />
            <RichEditor label="Extrait (FR)" value={editing.excerpt?.fr || ""} onChange={(v) => setEditing({ ...editing, excerpt: { ...editing.excerpt, fr: v } } as any)} placeholder="Résumé de l'article en français…" />
            <RichEditor label="Excerpt (EN)" value={editing.excerpt?.en || ""} onChange={(v) => setEditing({ ...editing, excerpt: { ...editing.excerpt, en: v } } as any)} placeholder="Article summary in English…" />
            <RichEditor label="Contenu (FR)" value={editing.body?.fr || ""} onChange={(v) => setEditing({ ...editing, body: { ...editing.body, fr: v } } as any)} placeholder="Rédigez le contenu de l'article en français…" />
            <RichEditor label="Body (EN)" value={editing.body?.en || ""} onChange={(v) => setEditing({ ...editing, body: { ...editing.body, en: v } } as any)} placeholder="Write the article content in English…" />
            <div className={styles.modalActions}>
              <button onClick={() => { setEditing(null); setCreating(false); }}>{t("admin.cancel")}</button>
              <button
                className={styles.save}
                onClick={async () => {
                  if (creating) await api.post("/admin/blog", editing);
                  else await api.put(`/admin/blog/${editing.id}`, editing);
                  await load();
                  setEditing(null); setCreating(false);
                }}
              >
                {t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label, value, onChange, type,
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className={styles.formField}>
      <span>{label}</span>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function Textarea({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className={styles.formField}>
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// ---------------- Referrals admin ----------------
interface ReferralRow {
  id: string;
  code: string;
  owner_email: string;
  owner_name: string;
  discount_pct: number;
  uses: number;
  active: boolean;
  created_at: string;
}

interface LeaderboardRow {
  code: string;
  owner_name: string;
  owner_email_masked: string;
  uses_this_month: number;
}

function ReferralsAdmin() {
  const { t, lang } = useI18n();
  const [list, setList] = useState<ReferralRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const load = () =>
    api.get<ReferralRow[]>("/admin/referrals").then((r) => setList(r.data)).catch(() => {});

  useEffect(() => {
    load();
    api.get<LeaderboardRow[]>("/referrals/leaderboard").then((r) => setLeaderboard(r.data)).catch(() => {});
  }, []);

  const totalUses = list.reduce((s, r) => s + (r.uses || 0), 0);

  const handleCreate = async () => {
    if (!newName && !newEmail) return;
    await api.post("/admin/referrals", { owner_name: newName, owner_email: newEmail });
    setCreating(false);
    setNewName("");
    setNewEmail("");
    load();
  };

  const handleToggle = async (code: string) => {
    await api.patch(`/admin/referrals/${code}/toggle`);
    load();
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>{t("admin.referrals")}</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#7a6f68" }}>
            {list.length} {lang === "fr" ? "codes" : "codes"} · {totalUses}{" "}
            {lang === "fr" ? "utilisations" : "uses"}
          </span>
          <button className={styles.add} onClick={() => setCreating(true)}>
            + {t("admin.referral.create")}
          </button>
        </div>
      </div>

      {creating && (
        <div className={styles.modalBackdrop} onClick={() => setCreating(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{t("admin.referral.create")}</h3>
            <Input
              label={t("admin.referral.ownerName")}
              value={newName}
              onChange={setNewName}
            />
            <Input
              label={t("admin.referral.ownerEmail")}
              value={newEmail}
              onChange={setNewEmail}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setCreating(false)}>{t("admin.cancel")}</button>
              <button className={styles.save} onClick={handleCreate}>
                {t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {list.length === 0 && (
          <p style={{ color: "#7a6f68", padding: "2rem 0" }}>
            {lang === "fr" ? "Aucun code de parrainage pour l'instant." : "No referral codes yet."}
          </p>
        )}
        {list.map((r) => (
          <div
            key={r.id}
            className={styles.row}
            data-testid={`referral-row-${r.code}`}
            style={{ opacity: r.active ? 1 : 0.5 }}
          >
            <div className={styles.rowInfo}>
              <strong style={{ fontFamily: "monospace", letterSpacing: "0.04em" }}>
                {r.code}
              </strong>
              <span>
                {r.owner_name || r.owner_email || "—"}
                {!r.active && (
                  <em style={{ marginLeft: "0.5rem", color: "#b44" }}>
                    · {t("admin.referral.inactive")}
                  </em>
                )}
              </span>
            </div>
            <span style={{ color: "#7a6f68", fontSize: "0.85rem" }}>
              {r.uses} {lang === "fr" ? "uses" : "uses"}
            </span>
            <span className={styles.price}>−{r.discount_pct}%</span>
            <button
              className={r.active ? styles.del : undefined}
              onClick={() => handleToggle(r.code)}
              data-testid={`toggle-referral-${r.code}`}
            >
              {r.active ? t("admin.referral.deactivate") : t("admin.referral.activate")}
            </button>
          </div>
        ))}
      </div>

      {leaderboard.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            {t("admin.referral.leaderboard")}
          </h3>
          <div className={styles.list}>
            {leaderboard.map((row, i) => (
              <div key={row.code} className={styles.row}>
                <span style={{ fontWeight: 700, color: "#b07d3a", minWidth: "1.5rem" }}>
                  #{i + 1}
                </span>
                <div className={styles.rowInfo}>
                  <strong style={{ fontFamily: "monospace" }}>{row.code}</strong>
                  <span>{row.owner_name || row.owner_email_masked || "—"}</span>
                </div>
                <span style={{ color: "#7a6f68", fontSize: "0.85rem" }}>
                  {row.uses_this_month} {lang === "fr" ? "ce mois" : "this month"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ---------------- Customers admin ----------------
interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
}

interface CustomerDetail extends CustomerSummary {
  orders: { session_id: string; amount: number; currency: string; items: any[]; payment_status: string; created_at: string }[];
  referral_codes: { code: string; discount_pct: number; uses: number; active: boolean }[];
}

function CustomersAdmin() {
  const { t, lang } = useI18n();
  const [list, setList] = useState<CustomerSummary[]>([]);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = () =>
    api.get<CustomerSummary[]>("/admin/customers")
      .then((r) => setList(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const r = await api.get<CustomerDetail>(`/admin/customers/${id}`);
      setDetail(r.data);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (id: string, activate: boolean) => {
    const endpoint = activate ? "activate" : "suspend";
    await api.patch(`/admin/customers/${id}/${endpoint}`);
    setConfirm(null);
    if (detail?.id === id) setDetail((d) => d ? { ...d, is_active: activate } : d);
    setList((prev) => prev.map((c) => c.id === id ? { ...c, is_active: activate } : c));
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading || detailLoading) return <p className={styles.muted}>…</p>;

  if (detail) {
    return (
      <div>
        <button className={styles.backBtn} onClick={() => setDetail(null)}>
          {t("admin.customers.back")}
        </button>

        <div className={styles.customerDetailHeader}>
          <div>
            <h2>{detail.name}</h2>
            <span className={styles.muted}>{detail.email}</span>
          </div>
          <div className={styles.customerDetailMeta}>
            <span className={`${styles.customerStatus} ${detail.is_active ? styles.customerActive : styles.customerSuspended}`}>
              {detail.is_active ? t("admin.customers.active") : t("admin.customers.suspended")}
            </span>
            <span className={styles.muted}>{t("admin.customers.registered")} : {fmtDate(detail.created_at)}</span>
          </div>
        </div>

        <div className={styles.customerActions}>
          {confirm === detail.id ? (
            <>
              <button
                className={`${styles.actionBtn} ${detail.is_active ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                onClick={() => toggleActive(detail.id, !detail.is_active)}
              >
                {detail.is_active ? t("admin.customers.confirmSuspend") : t("admin.customers.confirmActivate")}
              </button>
              <button className={styles.actionBtn} onClick={() => setConfirm(null)}>{t("admin.cancel")}</button>
            </>
          ) : (
            <button
              className={`${styles.actionBtn} ${detail.is_active ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
              onClick={() => setConfirm(detail.id)}
            >
              {detail.is_active ? t("admin.customers.suspend") : t("admin.customers.activate")}
            </button>
          )}
        </div>

        <div className={styles.customerSection}>
          <h3>{t("admin.customers.orders")} ({detail.orders.length})</h3>
          {detail.orders.length === 0 ? (
            <p className={styles.muted}>{t("admin.customers.noOrders")}</p>
          ) : (
            <div className={styles.customerOrderList}>
              {detail.orders.map((o) => (
                <div key={o.session_id} className={styles.customerOrderRow}>
                  <span className={styles.muted}>{fmtDate(o.created_at)}</span>
                  <span>{o.items.length} {lang === "fr" ? "article(s)" : "item(s)"}</span>
                  <span className={`${styles.customerStatus} ${o.payment_status === "paid" ? styles.customerActive : styles.customerSuspended}`}>
                    {o.payment_status}
                  </span>
                  <strong>{Number(o.amount).toFixed(2)} {o.currency.toUpperCase()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.customerSection}>
          <h3>{t("admin.customers.referralCodes")}</h3>
          {detail.referral_codes.length === 0 ? (
            <p className={styles.muted}>{t("admin.customers.noCodes")}</p>
          ) : (
            <div className={styles.customerCodeList}>
              {detail.referral_codes.map((c) => (
                <div key={c.code} className={styles.customerCodeRow}>
                  <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.code}</span>
                  <span className={styles.muted}>−{c.discount_pct}%</span>
                  <span className={styles.muted}>{c.uses} uses</span>
                  {!c.active && <span className={styles.customerSuspended}>{t("admin.referral.inactive")}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.customerTableHead}>
        <span>Nom / Email</span>
        <span className={styles.hideSmall}>{t("admin.customers.orders")}</span>
        <span className={styles.hideSmall}>{t("admin.customers.totalSpent")}</span>
        <span>{t("admin.customers.status")}</span>
        <span />
      </div>
      <div className={styles.customerList}>
        {list.map((c) => (
          <div key={c.id} className={styles.customerRow}>
            <div className={styles.customerInfo}>
              <strong>{c.name}</strong>
              <span className={styles.muted}>{c.email} · {fmtDate(c.created_at)}</span>
            </div>
            <span className={styles.hideSmall}>{c.order_count}</span>
            <span className={styles.hideSmall}>{Number(c.total_spent).toFixed(2)} €</span>
            <span className={`${styles.customerStatus} ${c.is_active ? styles.customerActive : styles.customerSuspended}`}>
              {c.is_active ? t("admin.customers.active") : t("admin.customers.suspended")}
            </span>
            <button className={styles.viewBtn} onClick={() => openDetail(c.id)}>
              {t("admin.customers.view")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
