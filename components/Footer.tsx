"use client";

import Link from "next/link";
import ContactPopover from "./ContactPopover";
import { useLanguage } from "../lib/LanguageContext";

const CONTACT_EMAIL = "pietromontanticomposer@gmail.com";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer
      id="contact"
      className="mt-12 border-t border-black/10 bg-transparent px-6 py-10 sm:px-10 lg:px-16"
      style={{ contain: "layout style paint" }}
    >
      <div className="mx-auto max-w-7xl text-sm">

        {/* Desktop: three-column grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:items-start sm:gap-6">
          <div className="col-span-1">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 text-[color:var(--foreground)] font-medium">{t("Compositore per Film e Media", "Composer for Film & Media")}</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">{t("Italia · UE", "Italy · EU")}</div>
          </div>

          <div className="col-span-1 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <ContactPopover
                buttonLabel={t("Contattami", "Contact Me")}
                buttonClassName="hero-btn hero-btn-secondary"
                panelId="contact-popover-footer-desktop"
              />
              <div className="text-xs text-[color:var(--muted)]">
                {CONTACT_EMAIL}
              </div>
            </div>
          </div>

          <div className="col-span-1 text-right">
            <div className="flex items-center justify-end gap-4">
              <a
                href="https://www.instagram.com/pietro_montanti_composer"
                aria-label="Instagram"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title">
                  <title id="insta-title">Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
                </svg>
              </a>
              <a
                href="https://www.imdb.com/it/name/nm14528995/?ref_=fn_t_1"
                aria-label="IMDb"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="imdb-title">
                  <title id="imdb-title">IMDb</title>
                  <path d="M22.3781 0H1.6218C.7411.0583.0587.7437.0018 1.5953l-.001 20.783c.0585.8761.7125 1.543 1.5559 1.6191A.337.337 0 0 0 1.6016 24h20.7971a.4579.4579 0 0 0 .0437-.002c.8727-.0768 1.5568-.8271 1.5568-1.7085V1.7098c0-.8914-.696-1.6416-1.584-1.7078A.3294.3294 0 0 0 22.3781 0zm0 .496a1.2144 1.2144 0 0 1 1.1252 1.2139v20.5797c0 .6377-.4875 1.1602-1.1045 1.2145H1.6016c-.5967-.0543-1.0645-.5297-1.1053-1.1258V1.6284C.5371 1.0185 1.0184.5364 1.6217.496h20.7564zM4.7954 8.2603v7.3636H2.8899V8.2603h1.9055zm6.5367 0v7.3636H9.6707v-4.9704l-.6711 4.9704H7.813l-.6986-4.8618-.0066 4.8618h-1.668V8.2603h2.468c.0748.4476.1492.9694.2307 1.5734l.2712 1.8713.4407-3.4447h2.4817zm2.9772 1.3289c.0742.0404.122.108.1417.2034.0279.0953.0345.3118.0345.6442v2.8548c0 .4881-.0345.7867-.0955.8954-.0609.1152-.2304.1695-.5018.1695V9.5211c.204 0 .3457.0205.4211.0681zm-.0211 6.0347c.4543 0 .8006-.0265 1.0245-.0742.2304-.0477.4204-.1357.5694-.2648.1556-.1218.2642-.298.3251-.5219.0611-.2238.1021-.6648.1021-1.3224v-2.5832c0-.6986-.0271-1.1668-.0742-1.4039-.041-.237-.1431-.4543-.3126-.6437-.1695-.1973-.4198-.3324-.7456-.421-.3191-.0808-.8542-.1285-1.7694-.1285h-1.4244v7.3636h2.3051zm5.14-1.7827c0 .3523-.0199.5762-.0544.6708-.033.0947-.1894.1424-.3046.1424-.1086 0-.19-.0477-.2238-.1351-.041-.0887-.0609-.2986-.0609-.6238v-1.9469c0-.3324.0199-.5423.0543-.6237.0338-.0808.1086-.122.2171-.122.1153 0 .2709.0412.3114.1425.041.0947.0609.2986.0609.6032v1.8926zm-2.4747-5.5809v7.3636h1.7157l.1152-.4675c.1556.1894.3251.3324.5152.4271.1828.0881.4608.1357.678.1357.3047 0 .5629-.0748.7802-.237.2165-.1562.3589-.3462.4198-.5628.0543-.2173.0887-.543.0887-.9841v-2.0675c0-.4409-.0139-.7324-.0344-.8681-.0199-.1357-.0742-.2781-.1695-.4204-.1021-.1425-.2437-.251-.4272-.3325-.1834-.0742-.3999-.1152-.6576-.1152-.2172 0-.4952.0477-.6846.1285-.1835.0887-.353.2238-.5086.4007V8.2603h-1.8309z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: stacked (same content, stacked) */}
        <div className="sm:hidden flex flex-col gap-4 text-center items-center">
          <div className="flex flex-col items-center">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">{t("Compositore per Film e Media — Italia · UE", "Composer for Film & Media — Italy · EU")}</div>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <ContactPopover
                buttonLabel={t("Contattami", "Contact Me")}
                buttonClassName="hero-btn hero-btn-secondary"
                panelId="contact-popover-footer-mobile"
              />
              <div className="text-xs text-[color:var(--muted)]">
                {CONTACT_EMAIL}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/pietro_montanti_composer"
              aria-label="Instagram"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title-mobile">
                <title id="insta-title-mobile">Instagram</title>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
              </svg>
            </a>
            <a
              href="https://www.imdb.com/it/name/nm14528995/?ref_=fn_t_1"
              aria-label="IMDb"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="imdb-title-mobile">
                <title id="imdb-title-mobile">IMDb</title>
                <path d="M22.3781 0H1.6218C.7411.0583.0587.7437.0018 1.5953l-.001 20.783c.0585.8761.7125 1.543 1.5559 1.6191A.337.337 0 0 0 1.6016 24h20.7971a.4579.4579 0 0 0 .0437-.002c.8727-.0768 1.5568-.8271 1.5568-1.7085V1.7098c0-.8914-.696-1.6416-1.584-1.7078A.3294.3294 0 0 0 22.3781 0zm0 .496a1.2144 1.2144 0 0 1 1.1252 1.2139v20.5797c0 .6377-.4875 1.1602-1.1045 1.2145H1.6016c-.5967-.0543-1.0645-.5297-1.1053-1.1258V1.6284C.5371 1.0185 1.0184.5364 1.6217.496h20.7564zM4.7954 8.2603v7.3636H2.8899V8.2603h1.9055zm6.5367 0v7.3636H9.6707v-4.9704l-.6711 4.9704H7.813l-.6986-4.8618-.0066 4.8618h-1.668V8.2603h2.468c.0748.4476.1492.9694.2307 1.5734l.2712 1.8713.4407-3.4447h2.4817zm2.9772 1.3289c.0742.0404.122.108.1417.2034.0279.0953.0345.3118.0345.6442v2.8548c0 .4881-.0345.7867-.0955.8954-.0609.1152-.2304.1695-.5018.1695V9.5211c.204 0 .3457.0205.4211.0681zm-.0211 6.0347c.4543 0 .8006-.0265 1.0245-.0742.2304-.0477.4204-.1357.5694-.2648.1556-.1218.2642-.298.3251-.5219.0611-.2238.1021-.6648.1021-1.3224v-2.5832c0-.6986-.0271-1.1668-.0742-1.4039-.041-.237-.1431-.4543-.3126-.6437-.1695-.1973-.4198-.3324-.7456-.421-.3191-.0808-.8542-.1285-1.7694-.1285h-1.4244v7.3636h2.3051zm5.14-1.7827c0 .3523-.0199.5762-.0544.6708-.033.0947-.1894.1424-.3046.1424-.1086 0-.19-.0477-.2238-.1351-.041-.0887-.0609-.2986-.0609-.6238v-1.9469c0-.3324.0199-.5423.0543-.6237.0338-.0808.1086-.122.2171-.122.1153 0 .2709.0412.3114.1425.041.0947.0609.2986.0609.6032v1.8926zm-2.4747-5.5809v7.3636h1.7157l.1152-.4675c.1556.1894.3251.3324.5152.4271.1828.0881.4608.1357.678.1357.3047 0 .5629-.0748.7802-.237.2165-.1562.3589-.3462.4198-.5628.0543-.2173.0887-.543.0887-.9841v-2.0675c0-.4409-.0139-.7324-.0344-.8681-.0199-.1357-.0742-.2781-.1695-.4204-.1021-.1425-.2437-.251-.4272-.3325-.1834-.0742-.3999-.1152-.6576-.1152-.2172 0-.4952.0477-.6846.1285-.1835.0887-.353.2238-.5086.4007V8.2603h-1.8309z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Legal row (centered) */}
        <div className="mt-6 border-t pt-4 text-xs text-[color:var(--muted)] flex flex-col items-center gap-3 text-center">
          <div className="font-medium">{t("P.IVA 04593080239", "VAT 04593080239")}</div>
          <div className="font-medium">© 2025 Pietro Montanti</div>
          <div className="flex gap-4 justify-center">
            <Link href="/privacy-policy" prefetch={false} className="hover:underline">{t("Informativa Privacy", "Privacy Policy")}</Link>
            <Link href="/cookie-policy" prefetch={false} className="hover:underline">{t("Cookie Policy", "Cookie Policy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
