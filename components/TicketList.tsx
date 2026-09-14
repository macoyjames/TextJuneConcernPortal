"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { SeverityBadge } from "./SeverityBadge";

export type TicketSummary = {
  id: string;
  vaName: string;
  slackName: string;
  managerName: string;
  severity: string;
  concernType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const FILTERS = ["ALL", "PENDING", "ESCALATED", "RESOLVED"] as const;

export function TicketList({
  tickets,
  showManagerColumn = false,
}: {
  tickets: TicketSummary[];
  showManagerColumn?: boolean;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => (filter === "ALL" ? true : t.status === filter))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.vaName.toLowerCase().includes(q) ||
          t.slackName.toLowerCase().includes(q) ||
          t.concernType.toLowerCase().includes(q) ||
          t.managerName.toLowerCase().includes(q)
        );
      });
  }, [tickets, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: tickets.length, PENDING: 0, ESCALATED: 0, RESOLVED: 0 };
    for (const t of tickets) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tickets]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-brand-700 text-white"
                  : "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              <span className="ml-1.5 opacity-70">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, type, manager…"
          className="input max-w-xs"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-12 gap-2 border-b border-brand-100 bg-brand-50/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-600 sm:grid">
          <div className="col-span-2">Submitted by</div>
          <div className="col-span-2">Concern type</div>
          {showManagerColumn && <div className="col-span-2">Manager</div>}
          <div className={showManagerColumn ? "col-span-2" : "col-span-2"}>Severity</div>
          <div className="col-span-2">Status</div>
          <div className={showManagerColumn ? "col-span-2" : "col-span-4"}>Last update</div>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-brand-400">No concerns match this filter.</p>
        )}

        {filtered.map((t) => (
          <Link
            key={t.id}
            href={`/ticket/${t.id}`}
            className="grid grid-cols-2 gap-2 border-b border-brand-50 px-4 py-3.5 text-sm last:border-0 hover:bg-brand-50/40 sm:grid-cols-12 sm:items-center"
          >
            <div className="col-span-2">
              <p className="font-medium text-brand-900">{t.vaName}</p>
              <p className="text-xs text-brand-400">@{t.slackName}</p>
            </div>
            <div className="col-span-2 text-brand-800">{t.concernType}</div>
            {showManagerColumn && <div className="col-span-2 text-brand-800">{t.managerName}</div>}
            <div className="col-span-2">
              <SeverityBadge severity={t.severity} />
            </div>
            <div className="col-span-2">
              <StatusBadge status={t.status} />
            </div>
            <div className={`text-xs text-brand-400 ${showManagerColumn ? "col-span-2" : "col-span-4"}`}>
              {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
