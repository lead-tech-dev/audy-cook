import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api, whatsappLink } from "@/lib/api";
import type { ResellerCountry } from "@/types";
import styles from "./Resellers.module.scss";

export default function Resellers() {
  const { t, lang } = useI18n();
  const [countries, setCountries] = useState<ResellerCountry[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    api.get<ResellerCountry[]>("/resellers").then((r) => {
      setCountries(r.data);
      if (r.data[0]) setActive(r.data[0].country.fr);
    }).catch(() => {});
  }, []);

  const current = countries.find((c) => c.country.fr === active);

  return (
    <div className={styles.page} data-testid="resellers-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span className="overline">{t("nav.resellers")}</span>
          <h1 className={styles.title}>{t("resellers.title")}</h1>
          <p className={styles.sub}>{t("resellers.sub")}</p>
        </div>
      </header>

      <section className={styles.list}>
        <div className={styles.tabs} role="tablist">
          {countries.map((c) => (
            <button
              key={c.country.fr}
              className={`${styles.tab} ${active === c.country.fr ? styles.tabActive : ""}`}
              onClick={() => setActive(c.country.fr)}
              data-testid={`country-tab-${c.country.fr}`}
            >
              <span className={styles.flag}>{c.flag}</span>
              <span>{c.country[lang]}</span>
              <span className={styles.count}>{c.stores.length}</span>
            </button>
          ))}
        </div>

        {current && (
          <div className={styles.stores}>
            {current.stores.map((s, i) => (
              <article key={i} className={`${styles.store} ${s.main ? styles.storeMain : ""}`} data-testid={`store-${i}`}>
                {s.main && <span className={styles.mainTag}>{lang === "fr" ? "Point principal" : "Main outlet"}</span>}
                <h3>{s.name}</h3>
                <p className={styles.address}>{s.address}</p>
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className={styles.phone}>
                    {s.phone}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <a
            href={whatsappLink("Bonjour AUDY COOK, j'aimerais connaître le point relais le plus proche.")}
            target="_blank"
            rel="noreferrer"
            className={styles.btn}
            data-testid="resellers-find-cta"
          >
            {t("resellers.findClosest")} →
          </a>
          <a
            href={whatsappLink("Bonjour AUDY COOK, j'aimerais devenir revendeur de vos produits.")}
            target="_blank"
            rel="noreferrer"
            className={styles.btnGhost}
            data-testid="resellers-become-cta"
          >
            {t("resellers.becomeReseller")}
          </a>
        </div>
      </section>
    </div>
  );
}
