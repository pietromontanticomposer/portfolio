import fs from "node:fs";
import path from "node:path";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

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
const fieldLabels = {
  titolare: "data controller",
  email_contatto: "contact email",
  hosting: "hosting",
  finalita: "purposes of processing",
  diritti: "data subject rights",
} as const;

try {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as PrivacyConfig;
  const errors: string[] = [];

  if (!parsed || typeof parsed !== "object") {
    errors.push("Config missing or invalid JSON.");
  } else {
    if (isEmpty(parsed.titolare) || isTodo(parsed.titolare)) errors.push(fieldLabels.titolare);
    if (isEmpty(parsed.email_contatto) || isTodo(parsed.email_contatto)) errors.push(fieldLabels.email_contatto);
    if (isEmpty(parsed.hosting) || isTodo(parsed.hosting)) errors.push(fieldLabels.hosting);

    const finalita = Array.isArray(parsed.finalita) ? parsed.finalita : [];
    if (finalita.length === 0 || finalita.some((item) => isEmpty(item) || isTodo(item))) {
      errors.push(fieldLabels.finalita);
    }

    const diritti = Array.isArray(parsed.diritti) ? parsed.diritti : [];
    if (diritti.length === 0 || diritti.some((item) => isEmpty(item) || isTodo(item))) {
      errors.push(fieldLabels.diritti);
    }
  }

  if (errors.length) {
    configError = `Invalid privacy config: ${errors.join(", ")}.`;
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
  return <PrivacyPolicyClient config={config} configError={configError} />;
}
