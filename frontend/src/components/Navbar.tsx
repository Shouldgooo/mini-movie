"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const links = [
  { href: "/discover", key: "navDiscover" },
  { href: "/my", key: "navMy" },
  { href: "/login", key: "navLogin" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="border-b border-border">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"
        aria-label={t("navMain")}
      >
        <Link
          href="/"
          className="text-sm font-medium tracking-[0.18em] uppercase"
        >
          MiniMovie
        </Link>

        <div className="flex items-center gap-4 text-sm sm:gap-6">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`) ||
              (link.href === "/discover" &&
                pathname.startsWith("/collections/"));

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`tracking-wide ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
