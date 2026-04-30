import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { BlogPost } from "@/types";
import styles from "./Blog.module.scss";

export default function Blog() {
  const { t, lang } = useI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    api.get<BlogPost[]>("/blog").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  const [first, ...rest] = posts;

  return (
    <div className={styles.page} data-testid="blog-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span className="overline">{t("nav.blog")}</span>
          <h1 className={styles.title}>{t("blog.title")}</h1>
          <p className={styles.sub}>{t("blog.sub")}</p>
        </div>
      </header>

      {first && (
        <Link to={`/blog/${first.slug}`} className={styles.featured} data-testid={`featured-${first.slug}`}>
          <div className={styles.featuredMedia}>
            <img src={first.cover_image} alt={first.title[lang]} />
          </div>
          <div className={styles.featuredText}>
            <span className={styles.cat}>{first.category[lang]}</span>
            <h2>{first.title[lang]}</h2>
            <p>{first.excerpt[lang]}</p>
            <span className={styles.readMore}>{t("blog.readMore")} →</span>
          </div>
        </Link>
      )}

      <section className={styles.grid}>
        {rest.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className={styles.card} data-testid={`post-${post.slug}`}>
            <div className={styles.cardMedia}>
              <img src={post.cover_image} alt={post.title[lang]} loading="lazy" />
            </div>
            <span className={styles.cat}>{post.category[lang]}</span>
            <h3>{post.title[lang]}</h3>
            <p>{post.excerpt[lang]}</p>
            <span className={styles.minRead}>
              {post.read_time} {t("blog.minRead")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
