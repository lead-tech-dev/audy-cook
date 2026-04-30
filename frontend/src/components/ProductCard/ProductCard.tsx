import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/i18n/I18nContext";
import type { Product } from "@/types";
import styles from "./ProductCard.module.scss";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, lang } = useI18n();
  const badgeLabel =
    product.badge === "bestseller"
      ? t("products.bestseller")
      : product.badge === "new"
        ? t("products.new")
        : null;

  return (
    <article className={styles.card} data-testid={`product-card-${product.slug}`}>
      <Link to={`/products/${product.slug}`} className={styles.media} data-testid={`product-link-${product.slug}`}>
        <img src={product.image} alt={product.name[lang]} loading="lazy" />
        {badgeLabel && (
          <span className={`${styles.badge} ${product.badge === "bestseller" ? styles.bestseller : styles.newBadge}`}>
            {badgeLabel}
          </span>
        )}
        <span className={styles.cat}>{product.category[lang]}</span>
      </Link>
      <div className={styles.body}>
        <Link to={`/products/${product.slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name[lang]}</h3>
        </Link>
        <p className={styles.desc}>{product.description[lang]}</p>
        <div className={styles.foot}>
          <div className={styles.price}>
            <span className={styles.priceFrom}>{t("products.from")}</span>
            <span className={styles.priceVal}>{product.price.toFixed(2)} €</span>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => add(product, 1)}
            disabled={!product.in_stock}
            data-testid={`add-to-cart-${product.slug}`}
          >
            {product.in_stock ? t("products.add") : t("products.outOfStock")}
          </button>
        </div>
      </div>
    </article>
  );
}
