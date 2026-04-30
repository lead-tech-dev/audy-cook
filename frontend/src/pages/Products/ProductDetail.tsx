import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { api, whatsappLink } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./ProductDetail.module.scss";

interface Testimonial {
  author: { fr: string; en: string };
  city: string;
  rating: number;
  body: { fr: string; en: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    author: { fr: "Aïcha N.", en: "Aïcha N." },
    city: "Luxembourg",
    rating: 5,
    body: {
      fr: "Le goût exact de chez maman. Je commande chaque mois pour ma famille, c'est devenu un rituel.",
      en: "The exact taste of mum's home. I order every month for my family — it's become a ritual.",
    },
  },
  {
    author: { fr: "Stéphane M.", en: "Stephen M." },
    city: "Bruxelles",
    rating: 5,
    body: {
      fr: "Livraison rapide, packaging soigné, et surtout : authenticité absolue. Bravo AUDY.",
      en: "Fast delivery, beautiful packaging, and above all: absolute authenticity. Well done AUDY.",
    },
  },
  {
    author: { fr: "Manuella K.", en: "Manuella K." },
    city: "Dortmund",
    rating: 5,
    body: {
      fr: "Mes invités m'ont demandé l'adresse. Le ndolé était comme à Douala. Inégalable.",
      en: "My guests asked me where I got it. The ndolé tasted just like Douala's. Unmatched.",
    },
  },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [all, setAll] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get<Product>(`/products/${slug}`),
      api.get<Product[]>("/products"),
    ])
      .then(([p, a]) => {
        setProduct(p.data);
        setAll(a.data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const related = useMemo(() => {
    if (!product) return [];
    return all
      .filter(
        (p) => p.id !== product.id && p.category[lang] === product.category[lang],
      )
      .slice(0, 3);
  }, [all, product, lang]);

  if (loading) return <div className={styles.state}>—</div>;
  if (!product)
    return (
      <div className={styles.state}>
        <h1>404</h1>
        <Link to="/products">{t("nav.products")} →</Link>
      </div>
    );

  const badgeLabel =
    product.badge === "bestseller"
      ? t("products.bestseller")
      : product.badge === "new"
        ? t("products.new")
        : null;

  return (
    <article className={styles.page} data-testid="product-detail-page">
      <div className={styles.crumb}>
        <Link to="/products" className={styles.back}>
          ← {t("nav.products")}
        </Link>
      </div>

      <section className={styles.hero}>
        <div className={styles.media}>
          <img src={product.image} alt={product.name[lang]} />
          {badgeLabel && (
            <span
              className={`${styles.badge} ${product.badge === "bestseller" ? styles.bsell : styles.new}`}
            >
              {badgeLabel}
            </span>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.cat}>{product.category[lang]}</span>
          <h1 className={styles.title}>{product.name[lang]}</h1>
          <p className={styles.desc}>{product.description[lang]}</p>

          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>{t("products.from")}</span>
            <span className={styles.priceVal}>
              {(product.price * qty).toFixed(2)} €
            </span>
          </div>

          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>{t("cart.quantity")}</span>
            <div className={styles.qty}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                data-testid="detail-qty-minus"
              >
                −
              </button>
              <span data-testid="detail-qty">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                data-testid="detail-qty-plus"
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.addBtn}
              onClick={() => add(product, qty)}
              disabled={!product.in_stock}
              data-testid="detail-add-to-cart"
            >
              {product.in_stock ? `${t("products.add")} →` : t("products.outOfStock")}
            </button>
            <a
              className={styles.waBtn}
              href={whatsappLink(
                `Bonjour AUDY COOK, je souhaite commander : ${product.name[lang]} × ${qty}`,
              )}
              target="_blank"
              rel="noreferrer"
              data-testid="detail-whatsapp"
            >
              WhatsApp
            </a>
          </div>

          <ul className={styles.bullets}>
            <li>
              <span>✓</span>
              {lang === "fr"
                ? "Conditionné à la main au Luxembourg"
                : "Hand-packaged in Luxembourg"}
            </li>
            <li>
              <span>✓</span>
              {lang === "fr"
                ? "Expédition Europe & UAE sous 3-5 jours"
                : "Shipped to Europe & UAE in 3-5 days"}
            </li>
            <li>
              <span>✓</span>
              {lang === "fr" ? "Livraison offerte dès 50€" : "Free shipping over €50"}
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.tInner}>
          <span className="overline">
            {lang === "fr" ? "Avis clients" : "Customer reviews"}
          </span>
          <h2>{lang === "fr" ? "Ce qu'ils en disent." : "What they say."}</h2>
          <div className={styles.tGrid}>
            {TESTIMONIALS.map((tt, i) => (
              <article key={i} className={styles.t} data-testid={`testimonial-${i}`}>
                <div className={styles.stars}>
                  {Array.from({ length: tt.rating }).map((_, k) => (
                    <span key={k}>★</span>
                  ))}
                </div>
                <p className={styles.tBody}>"{tt.body[lang]}"</p>
                <footer>
                  <strong>{tt.author[lang]}</strong>
                  <span>{tt.city}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className={styles.related}>
          <span className="overline">
            {lang === "fr" ? "À découvrir aussi" : "You may also like"}
          </span>
          <h2>{lang === "fr" ? "Mêmes saveurs." : "Same flavours."}</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
