import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api, whatsappLink } from "@/lib/api";
import type { MenuItem } from "@/types";
import styles from "./Menu.module.scss";

export default function MenuPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    api.get<MenuItem[]>("/menu").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div className={styles.page} data-testid="menu-page">
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span className="overline">{t("nav.menu")}</span>
          <h1 className={styles.title}>{t("menu.title")}</h1>
          <p className={styles.sub}>{t("menu.sub")}</p>
        </div>
      </header>

      <section className={styles.list}>
        <ol className={styles.items}>
          {items.map((item, idx) => (
            <li key={item.id} className={styles.item} data-testid={`menu-item-${idx}`}>
              <span className={styles.num}>{String(idx + 1).padStart(2, "0")}</span>
              <div className={styles.itemBody}>
                <div className={styles.itemHead}>
                  <h3>{item.name[lang]}</h3>
                  <span className={styles.dotted} />
                  <span className={styles.price}>{item.price.toFixed(2)} €</span>
                </div>
                <p className={styles.itemDesc}>{item.description[lang]}</p>
                <span className={styles.minQty}>
                  {t("menu.minQty")} {item.min_quantity} {t("menu.plates")}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.cta}>
          <a
            href={whatsappLink(
              "Bonjour AUDY COOK, j'aimerais commander depuis votre menu traditionnel."
            )}
            target="_blank"
            rel="noreferrer"
            className={styles.btn}
            data-testid="menu-whatsapp-cta"
          >
            {t("menu.order")} →
          </a>
        </div>
      </section>
    </div>
  );
}
