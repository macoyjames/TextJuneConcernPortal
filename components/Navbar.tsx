"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { NotificationBell } from "./NotificationBell";

type NavUser = {
  name?: string | null;
  image?: string | null;
  isManager: boolean;
};

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const links = [
    { href: "/submit", label: "Submit a concern" },
    { href: "/queue", label: "Queue" },
    ...(user.isManager ? [{ href: "/admin", label: "My queue (manager)" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
              TJ
            </span>
            <span className="hidden text-sm font-semibold text-brand-900 sm:inline">
              TextJune Concern Portal
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname?.startsWith(link.href)
                    ? "bg-brand-50 text-brand-800"
                    : "text-brand-700/80 hover:bg-brand-50 hover:text-brand-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="hidden text-sm text-brand-800 md:inline">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-medium text-brand-600 hover:text-brand-800"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-brand-100 px-4 py-1.5 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
              pathname?.startsWith(link.href)
                ? "bg-brand-50 text-brand-800"
                : "text-brand-700/80"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
