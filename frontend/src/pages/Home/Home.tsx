import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { api, whatsappLink } from "@/lib/api";
import type { Product, BlogPost } from "@/types";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./Home.module.scss";

const HERO_IMAGE =
  "https://static.prod-images.emergentagent.com/jobs/7706c894-0530-43fe-9cd2-c8b62dc972ce/images/1bbc185000a873c1711bef67ab8e0d107fbf1b6b93af3585d3c0050e87d5eb15.png";
const SPICES_BG =
  "https://static.prod-images.emergentagent.com/jobs/7706c894-0530-43fe-9cd2-c8b62dc972ce/images/e9d7698b67e82b700555f128ad1fabd4bc86c958c69a410e5cba16a785ffb4ee.png";
const CATERING_IMAGE =
  "https://static.prod-images.emergentagent.com/jobs/7706c894-0530-43fe-9cd2-c8b62dc972ce/images/8e924b236ef1d8d7a8930b058f40c9119f3c18c5e20868c581c0785aa885b0c2.png";

export default function Home() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    api.get<Product[]>("/products").then((r) => setProducts(r.data.slice(0, 3))).catch(() => {});
    api.get<BlogPost[]>("/blog").then((r) => setPosts(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className={styles.home} data-testid="home-page">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>{t("home.eyebrow")}</span>
            <h1 className={styles.heroTitle}>{t("home.hero.title")}</h1>
            <p className={styles.heroSub}>{t("home.hero.sub")}</p>
            <div className={styles.heroCtas}>
              <Link to="/products" className={styles.btnPrimary} data-testid="hero-cta-products">
                {t("home.hero.cta1")} →
              </Link>
              <Link to="/menu" className={styles.btnGhost} data-testid="hero-cta-menu">
                {t("home.hero.cta2")}
              </Link>
            </div>
            <div className={styles.heroMeta}>
              <div>
                <span className={styles.metaNum}>5</span>
                <span className={styles.metaLabel}>{lang === "fr" ? "pays desservis" : "countries served"}</span>
              </div>
              <div>
                <span className={styles.metaNum}>15+</span>
                <span className={styles.metaLabel}>{lang === "fr" ? "points relais" : "pickup points"}</span>
              </div>
              <div>
                <span className={styles.metaNum}>100%</span>
                <span className={styles.metaLabel}>{lang === "fr" ? "fait main" : "handmade"}</span>
              </div>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <img src={HERO_IMAGE} alt="Cuisine camerounaise" />
            <div className={styles.heroMediaTag}>
              <span>Made with patience</span>
              <span className={styles.tagYear}>est. 2020</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={styles.marqueeItem}>
              {t("home.marquee")}
            </span>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div className={styles.storyText}>
            <span className={styles.eyebrow}>{t("home.story.eyebrow")}</span>
            <h2 className={styles.h2}>{t("home.story.title")}</h2>
            <p>{t("home.story.body")}</p>
          </div>
          <div className={styles.storyImage}>
            <img src={SPICES_BG} alt="Épices" />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className={styles.products}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>{t("home.products.eyebrow")}</span>
          <h2 className={styles.h2}>{t("home.products.title")}</h2>
          <Link to="/products" className={styles.seeAll}>
            {t("home.products.cta")} →
          </Link>
        </div>
        <div className={styles.productsGrid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Menu CTA on dark moss bg */}
      <section className={styles.menu}>
        <div className={styles.menuInner}>
          <div className={styles.menuText}>
            <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>{t("home.menu.eyebrow")}</span>
            <h2 className={`${styles.h2} ${styles.h2Light}`}>{t("home.menu.title")}</h2>
            <p>{t("home.menu.body")}</p>
            <Link to="/menu" className={styles.btnLight}>
              {t("home.menu.cta")} →
            </Link>
          </div>
          <ul className={styles.menuList}>
            <li><span>01</span><strong>Ndolé</strong><em>aux arachides</em></li>
            <li><span>02</span><strong>Poulet DG</strong><em>plantains</em></li>
            <li><span>03</span><strong>Koki</strong><em>haricots noirs</em></li>
            <li><span>04</span><strong>Poisson braisé</strong><em>épices</em></li>
          </ul>
        </div>
      </section>

      {/* Catering */}
      <section className={styles.catering}>
        <div className={styles.cateringInner}>
          <div className={styles.cateringMedia}>
            <img src={CATERING_IMAGE} alt="Service traiteur" />
          </div>
          <div className={styles.cateringText}>
            <span className={styles.eyebrow}>{t("home.catering.eyebrow")}</span>
            <h2 className={styles.h2}>{t("home.catering.title")}</h2>
            <a
              href={whatsappLink("Bonjour AUDY COOK, j'aimerais avoir un devis pour un événement.")}
              target="_blank"
              rel="noreferrer"
              className={styles.btnPrimary}
              data-testid="catering-whatsapp-cta"
            >
              {t("home.catering.cta")} →
            </a>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className={styles.blog}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>{t("home.blog.eyebrow")}</span>
          <h2 className={styles.h2}>{t("home.blog.title")}</h2>
          <Link to="/blog" className={styles.seeAll}>
            {t("home.blog.cta")} →
          </Link>
        </div>
        <div className={styles.blogGrid}>
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className={styles.blogCard} data-testid={`blog-card-${post.slug}`}>
              <div className={styles.blogMedia}>
                <img src={post.cover_image} alt={post.title[lang]} loading="lazy" />
              </div>
              <span className={styles.blogCat}>{post.category[lang]}</span>
              <h3>{post.title[lang]}</h3>
              <p>{post.excerpt[lang]}</p>
              <span className={styles.blogTime}>{post.read_time} {t("blog.minRead")}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
