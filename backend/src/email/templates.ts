/**
 * Build a polished HTML email for the referral redemption notification.
 */
export function referralRedeemedEmailHtml(opts: {
  ownerName: string;
  redeemerName: string;
  code: string;
  totalUses: number;
}): string {
  const greeting = opts.ownerName ? `Bonjour ${opts.ownerName},` : 'Bonjour,';
  const redeemer = opts.redeemerName || 'un·e ami·e';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Merci, votre code AUDY COOK vient d'être utilisé</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Cormorant Garamond',serif;color:#1f1a17;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(31,26,23,0.08);">
        <tr>
          <td style="padding:32px 36px;background:#1f1a17;color:#faf8f5;">
            <div style="font-family:Georgia,serif;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#d99c3d;">audy cook</div>
            <div style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin-top:6px;font-style:italic;">Merci pour votre parrainage.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">${greeting}</p>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">
              Bonne nouvelle : <strong>${redeemer}</strong> vient d'utiliser votre code de parrainage&nbsp;:
            </p>
            <div style="background:#f5e9d4;border:1px dashed #a64036;padding:18px;text-align:center;font-family:'Courier New',monospace;font-size:20px;letter-spacing:0.06em;color:#1f1a17;font-weight:700;margin:0 0 18px;">
              ${opts.code}
            </div>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">
              Votre code a déjà été utilisé <strong>${opts.totalUses} fois</strong> au total. 
              Bravo&nbsp;! En remerciement, nous créditons <strong style="color:#a64036;">−5 €</strong> sur votre prochaine commande
              (à demander via WhatsApp en mentionnant cet email).
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
              <tr><td>
                <a href="https://wa.me/352661299974?text=Bonjour%20AUDY%20COOK,%20je%20souhaite%20utiliser%20mon%20cr%C3%A9dit%20parrainage."
                   style="display:inline-block;background:#25d366;color:#fff;padding:14px 26px;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
                  Réclamer mon crédit via WhatsApp →
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#7a6f68;">
              Continuez à partager votre code à vos proches : à chaque utilisation, vous gagnez un crédit supplémentaire et eux profitent de −10% sur leur première commande.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px;background:#f0ebe1;color:#7a6f68;font-size:12px;line-height:1.6;letter-spacing:0.04em;">
            AUDY COOK · Repas camerounais au Luxembourg<br/>
            Cet email vous est envoyé suite à l'utilisation de votre code de parrainage.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
