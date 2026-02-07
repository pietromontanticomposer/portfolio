"use client";

import { memo, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

// Replace with your Formspree form ID from https://formspree.io
const FORMSPREE_ID = "xwpkgjqk";

function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-3">
        <p className="text-sm text-[color:var(--foreground)] font-medium">
          {t("Grazie! Ti terrò aggiornato.", "Thanks! I'll keep you updated.")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-sm text-[color:var(--foreground)] font-medium text-center mb-3">
        {t(
          "Vuoi restare aggiornato sulle mie ultime novità?",
          "Want to stay updated on my latest news?"
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("La tua email", "Your email")}
          required
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-[color:var(--btn-border)] bg-[color:var(--btn-bg)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)] focus:ring-opacity-20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="hero-btn hero-btn-secondary btn-compact whitespace-nowrap"
        >
          {status === "loading"
            ? t("Invio...", "Sending...")
            : t("Iscriviti", "Subscribe")}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-500 mt-2 text-center">
          {t("Errore. Riprova più tardi.", "Error. Please try again.")}
        </p>
      )}
    </div>
  );
}

export default memo(NewsletterSignup);
