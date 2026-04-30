import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./Products.module.scss";

export default function Products() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.get<Product[]>("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category[lang])))];
  const filtered = filter === "all" ? products : products.filter((p) => p.category[lang] === filter);

  return (
    <div className={styles.page} data-testid="products-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span className="overline">{t("nav.products")}</span>
          <h1 className={styles.title}>{t("products.title")}</h1>
          <p className={styles.sub}>{t("products.sub")}</p>
        </div>
      </header>

      <section className={styles.list}>
        <div className={styles.filters}>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${filter === c ? styles.filterActive : ""}`}
              onClick={() => setFilter(c)}
              data-testid={`filter-${c}`}
            >
              {c === "all" ? (lang === "fr" ? "Tous" : "All") : c}
            </button>
          ))}
        </div>
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {filtered.length === 0 && <p className={styles.empty}>—</p>}
        </div>
      </section>
    </div>
  );
}
