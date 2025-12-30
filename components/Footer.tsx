import ContactPopover from "./ContactPopover";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-black/10 bg-transparent px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl text-sm">

        {/* Desktop: three-column grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:items-start sm:gap-6">
          <div className="col-span-1">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 text-[color:var(--foreground)] font-medium">Composer for Film &amp; Media</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">Italy · EU</div>
          </div>

          <div className="col-span-1 flex justify-center">
            <ContactPopover
              buttonLabel="Contact Me"
              buttonClassName="appearance-none inline-flex items-center justify-center rounded-md border border-[color:var(--muted)] bg-transparent px-6 py-3 text-base font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]/6"
            />
          </div>

          <div className="col-span-1 text-right">
            <div className="flex items-center justify-end">
              <a
                href="https://www.instagram.com/pietro_montanti_composer"
                aria-label="Instagram"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title">
                  <title id="insta-title">Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: stacked (same content, stacked) */}
        <div className="sm:hidden flex flex-col gap-4 text-center items-center">
          <div className="flex flex-col items-center">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">Composer for Film &amp; Media — Italy · EU</div>
          </div>

          <div className="flex justify-center">
            <ContactPopover
              buttonLabel="Contact Me"
              buttonClassName="appearance-none inline-flex items-center justify-center rounded-md border border-[color:var(--muted)] bg-transparent px-5 py-3 text-base font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]/6"
            />
          </div>

          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/pietro_montanti_composer"
              aria-label="Instagram"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title-mobile">
                <title id="insta-title-mobile">Instagram</title>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        {/* (Contact button moved into the desktop center column and mobile stack) */}

        {/* Legal row (centered) */}
        <div className="mt-6 border-t pt-4 text-xs text-[color:var(--muted)] flex flex-col items-center gap-3 text-center">
          <div className="font-medium">VAT 04593080239</div>
          <div className="font-medium">© 2025 Pietro Montanti</div>
          <div className="flex gap-4 justify-center">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
            <a href="/cookie-settings" className="hover:underline">Manage cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
