"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  ticketId: string | null;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setItems(await res.json());
    } catch {
      // best-effort — the bell just won't update this cycle
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = items.filter((i) => !i.read).length;

  async function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await fetch("/api/notifications", { method: "PATCH" });
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative rounded-full p-2 text-brand-700 hover:bg-brand-50"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-brand-100 bg-white shadow-lg">
          <div className="border-b border-brand-100 px-4 py-2.5 text-sm font-semibold text-brand-900">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-brand-400">
                You&apos;re all caught up.
              </p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.ticketId ? `/ticket/${n.ticketId}` : "#"}
                onClick={() => setOpen(false)}
                className={`block border-b border-brand-50 px-4 py-3 text-sm last:border-0 hover:bg-brand-50 ${
                  !n.read ? "bg-brand-50/60" : ""
                }`}
              >
                <p className="text-brand-900">{n.message}</p>
                <p className="mt-0.5 text-xs text-brand-400">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
