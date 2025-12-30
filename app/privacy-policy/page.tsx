import fs from "node:fs";
import path from "node:path";

type PrivacyConfig = {
  titolare: string;
  email_contatto: string;
  hosting: string;
  finalita: string[];
  diritti: string[];
};

const configPath = path.join(process.cwd(), "privacy.config.json");
const isProduction = process.env.NODE_ENV === "production";

let config: PrivacyConfig | null = null;
let configError: string | null = null;

const isEmpty = (value: string) => !value || value.trim().length === 0;
const isTodo = (value: string) => /todo/i.test(value);

try {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as PrivacyConfig;
  const errors: string[] = [];

  if (!parsed || typeof parsed !== "object") {
    errors.push("Config missing or invalid JSON.");
  } else {
    if (isEmpty(parsed.titolare) || isTodo(parsed.titolare)) errors.push("titolare");
    if (isEmpty(parsed.email_contatto) || isTodo(parsed.email_contatto)) errors.push("email_contatto");
    if (isEmpty(parsed.hosting) || isTodo(parsed.hosting)) errors.push("hosting");

    const finalita = Array.isArray(parsed.finalita) ? parsed.finalita : [];
    if (finalita.length === 0 || finalita.some((item) => isEmpty(item) || isTodo(item))) {
      errors.push("finalita");
    }

    const diritti = Array.isArray(parsed.diritti) ? parsed.diritti : [];
    if (diritti.length === 0 || diritti.some((item) => isEmpty(item) || isTodo(item))) {
      errors.push("diritti");
    }
  }

  if (errors.length) {
    configError = `Privacy config non valida: ${errors.join(", ")}.`;
  } else {
    config = parsed;
  }
} catch (error) {
  configError = error instanceof Error ? error.message : "Unable to load privacy.config.json.";
}

if (isProduction && configError) {
  throw new Error(configError);
}

export default function PrivacyPolicyPage() {
  if (configError || !config) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="section-title text-3xl text-[color:var(--foreground)]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          {configError ?? "Privacy config non disponibile."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="section-title text-3xl text-[color:var(--foreground)]">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <div>
          <div className="text-[color:var(--foreground)] font-semibold">Titolare</div>
          <div>{config.titolare}</div>
        </div>
        <div>
          <div className="text-[color:var(--foreground)] font-semibold">Email di contatto</div>
          <div>{config.email_contatto}</div>
        </div>
        <div>
          <div className="text-[color:var(--foreground)] font-semibold">Hosting</div>
          <div>{config.hosting}</div>
        </div>
        <div>
          <div className="text-[color:var(--foreground)] font-semibold">Finalita del trattamento</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {config.finalita.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[color:var(--foreground)] font-semibold">Diritti dell'interessato</div>
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
