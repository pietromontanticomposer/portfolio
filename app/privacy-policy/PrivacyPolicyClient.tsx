"use client";

import { useLanguage } from "../../lib/LanguageContext";

type PrivacyConfig = {
  titolare: string;
  email_contatto: string;
  hosting: string;
  finalita: string[];
  diritti: string[];
};

const labelsData = {
  it: {
    title: "Informativa Privacy",
    configNotAvailable: "Configurazione privacy non disponibile.",
    dataController: "Titolare del trattamento",
    contactEmail: "Email di contatto",
    hosting: "Hosting",
    purposes: "Finalità del trattamento",
    rights: "Diritti dell'interessato",
  },
  en: {
    title: "Privacy Policy",
    configNotAvailable: "Privacy config not available.",
    dataController: "Data controller",
    contactEmail: "Contact email",
    hosting: "Hosting",
    purposes: "Purposes of processing",
    rights: "Data subject rights",
  },
};

type Props = {
  config: PrivacyConfig | null;
  configError: string | null;
};

export default function PrivacyPolicyClient({ config, configError }: Props) {
  const { language } = useLanguage();
  const labels = labelsData[language];

  if (configError || !config) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="section-title text-3xl text-[color:var(--foreground)]">
          {labels.title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          {configError ?? labels.configNotAvailable}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="section-title text-3xl text-[color:var(--foreground)]">
        {labels.title}
      </h1>
      <div className="mt-6 space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <div>
          <div className="font-semibold text-[color:var(--foreground)]">
            {labels.dataController}
          </div>
          <div>{config.titolare}</div>
        </div>
        <div>
          <div className="font-semibold text-[color:var(--foreground)]">
            {labels.contactEmail}
          </div>
          <div>{config.email_contatto}</div>
        </div>
        <div>
          <div className="font-semibold text-[color:var(--foreground)]">
            {labels.hosting}
          </div>
          <div>{config.hosting}</div>
        </div>
        <div>
          <div className="font-semibold text-[color:var(--foreground)]">
            {labels.purposes}
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {config.finalita.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-[color:var(--foreground)]">
            {labels.rights}
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {config.diritti.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
