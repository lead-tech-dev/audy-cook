import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { BlogPost as BlogPostType } from "@/types";
import styles from "./BlogPost.module.scss";

function openPopup(url: string) {
  const w = 600, h = 500;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  window.open(url, "_blank", `width=${w},height=${h},left=${left},top=${top},resizable,scrollbars`);
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get<BlogPostType>(`/blog/${slug}`)
      .then((r) => setPost(r.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>—</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>404</h1>
          <Link to="/blog">{t("nav.blog")}</Link>
        </div>
      </div>
    );
  }

  const rawUrl = window.location.href;
  const pageUrl = encodeURIComponent(rawUrl);
  const pageTitle = encodeURIComponent(post.title[lang]);

  function handleCopy() {
    navigator.clipboard.writeText(rawUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className={styles.page} data-testid="blog-post-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <Link to="/blog" className={styles.back}>
            ← {t("nav.blog")}
          </Link>
          <span className={styles.cat}>{post.category[lang]}</span>
          <h1 className={styles.title}>{post.title[lang]}</h1>
          <p className={styles.excerpt}>{post.excerpt[lang]}</p>
          <span className={styles.meta}>
            {post.read_time} {t("blog.minRead")}
          </span>
        </div>
      </header>
      <div className={styles.cover}>
        <img src={post.cover_image} alt={post.title[lang]} />
      </div>
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: post.body[lang] }}
      />

      <div className={styles.share}>
        <span className={styles.shareLabel}>{t("blog.share")}</span>
        <div className={styles.shareButtons}>
          {/* Facebook */}
          <button
            type="button"
            className={`${styles.shareBtn} ${styles.shareFacebook}`}
            onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`)}
            aria-label={t("blog.share.facebook")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            {t("blog.share.facebook")}
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            className={`${styles.shareBtn} ${styles.shareTwitter}`}
            onClick={() => openPopup(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`)}
            aria-label={t("blog.share.twitter")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {t("blog.share.twitter")}
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${pageTitle}%20${pageUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.shareBtn} ${styles.shareWhatsapp}`}
            aria-label={t("blog.share.whatsapp")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            {t("blog.share.whatsapp")}
          </a>

          {/* Copy link */}
          <button
            type="button"
            className={`${styles.shareBtn} ${styles.shareCopy} ${copied ? styles.shareCopied : ""}`}
            onClick={handleCopy}
            aria-label={t("blog.share.copy")}
          >
            {copied ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
            {copied ? t("blog.share.copied") : t("blog.share.copy")}
          </button>
        </div>
      </div>
    </article>
  );
}
