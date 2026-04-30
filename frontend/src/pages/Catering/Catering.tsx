import React from "react";
import { useI18n } from "@/i18n/I18nContext";
import { whatsappLink } from "@/lib/api";
import styles from "./Catering.module.scss";

const HERO =
  "https://static.prod-images.emergentagent.com/jobs/7706c894-0530-43fe-9cd2-c8b62dc972ce/images/8e924b236ef1d8d7a8930b058f40c9119f3c18c5e20868c581c0785aa885b0c2.png";
const SECONDARY =
  "https://images.unsplash.com/photo-1751651054945-882d49cbdbfc?auto=format&fit=crop&w=1400&q=80";

export default function Catering() {
  const { t } = useI18n();
  return (
    <div className={styles.page} data-testid="catering-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <div>
            <span className="overline">{t("nav.catering")}</span>
            <h1 className={styles.title}>{t("catering.title")}</h1>
            <p className={styles.sub}>{t("catering.sub")}</p>
            <a
              href={whatsappLink("Bonjour AUDY COOK, j'aimerais avoir des informations sur vos services gastronomiques.")}
              target="_blank"
              rel="noreferrer"
              className={styles.btn}
              data-testid="catering-cta"
            >
              {t("catering.cta")} →
            </a>
          </div>
          <div className={styles.media}>
            <img src={HERO} alt="Service traiteur" />
          </div>
        </div>
      </header>

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {(["1", "2", "3", "4"] as const).map((n) => (
            <div key={n} className={styles.feature}>
              <span className={styles.featNum}>0{n}</span>
              <h3>{t(`catering.feature${n}.title` as any)}</h3>
              <p>{t(`catering.feature${n}.body` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.info}>
        <div className={styles.infoInner}>
          <div className={styles.infoMedia}>
            <img src={SECONDARY} alt="Buffet" />
          </div>
          <div className={styles.infoText}>
            <span className="overline">{t("catering.info.title")}</span>
            <ul>
              <li>{t("catering.info.li1")}</li>
              <li>{t("catering.info.li2")}</li>
              <li>{t("catering.info.li3")}</li>
              <li>{t("catering.info.li4")}</li>
            </ul>
            <a
              href={whatsappLink("Bonjour AUDY COOK, j'aimerais avoir un devis pour un événement.")}
              target="_blank"
              rel="noreferrer"
              className={styles.btnDark}
            >
              {t("catering.cta")} →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
