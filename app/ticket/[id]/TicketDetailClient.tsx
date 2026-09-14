"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";

type Edit = { id: string; previousContent: string; editedAt: string };
type Response = {
  id: string;
  content: string;
  managerName: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  edits: Edit[];
};
type StatusChange = { id: string; fromStatus: string | null; toStatus: string; changedAt: string };
type TicketFile = { url: string; filename: string };

type Ticket = {
  id: string;
  vaName: string;
  slackName: string;
  managerName: string;
  severity: string;
  concernType: string;
  description: string;
  impact: string;
  actionsTaken: string | null;
  needed: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  files: TicketFile[];
  statusChanges: StatusChange[];
  responses: Response[];
};

const STATUS_OPTIONS = ["PENDING", "ESCALATED", "RESOLVED"];

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-brand-900">{value}</p>
    </div>
  );
}

export function TicketDetailClient({
  ticket: initialTicket,
  canRespond,
  justSubmitted,
}: {
  ticket: Ticket;
  canRespond: boolean;
  justSubmitted: boolean;
}) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [newResponse, setNewResponse] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  async function changeStatus(status: string) {
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket((t) => ({
          ...t,
          status: updated.status,
          statusChanges: updated.statusChanges,
          updatedAt: updated.updatedAt,
        }));
      }
    } finally {
      setStatusSaving(false);
    }
  }

  async function postResponse() {
    if (!newResponse.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newResponse }),
      });
      if (res.ok) {
        const created = await res.json();
        setTicket((t) => ({ ...t, responses: [...t.responses, created] }));
        setNewResponse("");
      }
    } finally {
      setPosting(false);
    }
  }

  async function saveEdit(responseId: string) {
    if (!editDraft.trim()) return;
    const res = await fetch(`/api/tickets/${ticket.id}/responses/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editDraft }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTicket((t) => ({
        ...t,
        responses: t.responses.map((r) => (r.id === responseId ? updated : r)),
      }));
      setEditingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {justSubmitted && (
        <div className="mb-6 rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-800">
          Your concern was submitted. {ticket.managerName} has been notified.
        </div>
      )}

      <button onClick={() => router.back()} className="mb-4 text-sm text-brand-500 hover:text-brand-700">
        ← Back
      </button>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-950">{ticket.concernType}</h1>
            <p className="mt-1 text-sm text-brand-500">
              Submitted by <strong>{ticket.vaName}</strong> (@{ticket.slackName}) · routed to{" "}
              <strong>{ticket.managerName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={ticket.severity} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="mt-2 text-xs text-brand-400">
          Opened {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")} · last updated{" "}
          {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
        </p>

        <div className="mt-6 space-y-5 border-t border-brand-50 pt-5">
          <Field label="Description" value={ticket.description} />
          <Field label="Impact" value={ticket.impact} />
          <Field label="Actions already taken" value={ticket.actionsTaken} />
          <Field label="What is needed" value={ticket.needed} />

          {ticket.files.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                Attachments
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {ticket.files.map((f) => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      📎 {f.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {canRespond && (
          <div className="mt-6 flex items-center gap-3 border-t border-brand-50 pt-5">
            <label className="text-sm font-medium text-brand-800">Status:</label>
            <select
              value={ticket.status}
              disabled={statusSaving}
              onChange={(e) => changeStatus(e.target.value)}
              className="input w-auto py-1.5"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Manager response{ticket.responses.length !== 1 ? "s" : ""}
        </h2>

        <div className="mt-3 space-y-4">
          {ticket.responses.length === 0 && (
            <p className="rounded-lg border border-dashed border-brand-200 bg-white px-4 py-6 text-center text-sm text-brand-400">
              No response yet.
            </p>
          )}

          {ticket.responses.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-900">{r.managerName}</p>
                <p className="text-xs text-brand-400">
                  {format(new Date(r.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  {r.edited && (
                    <>
                      {" · edited "}
                      {formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true })}
                    </>
                  )}
                </p>
              </div>

              {editingId === r.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="input"
                    rows={3}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(r.id)} className="btn-primary px-3 py-1.5 text-xs">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-brand-800">{r.content}</p>
              )}

              <div className="mt-2 flex items-center gap-3">
                {canRespond && editingId !== r.id && (
                  <button
                    onClick={() => {
                      setEditingId(r.id);
                      setEditDraft(r.content);
                    }}
                    className="text-xs font-medium text-brand-600 hover:text-brand-800"
                  >
                    Edit
                  </button>
                )}
                {r.edited && (
                  <button
                    onClick={() => setHistoryOpenId(historyOpenId === r.id ? null : r.id)}
                    className="text-xs font-medium text-brand-500 hover:text-brand-700"
                  >
                    {historyOpenId === r.id ? "Hide" : "View"} edit history ({r.edits.length})
                  </button>
                )}
              </div>

              {historyOpenId === r.id && (
                <div className="mt-3 space-y-2 border-t border-brand-50 pt-3">
                  {r.edits.map((e) => (
                    <div key={e.id} className="rounded-md bg-brand-50/60 px-3 py-2">
                      <p className="text-xs text-brand-400">
                        Previous version · {format(new Date(e.editedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-brand-700">
                        {e.previousContent}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {canRespond && (
          <div className="card mt-4 p-4">
            <label className="label">Add a response</label>
            <textarea
              rows={3}
              className="input"
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Write your response…"
            />
            <button
              onClick={postResponse}
              disabled={posting || !newResponse.trim()}
              className="btn-primary mt-2"
            >
              {posting ? "Posting…" : "Post response"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
