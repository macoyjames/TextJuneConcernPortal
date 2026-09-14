"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload, type UploadedFile } from "@/components/FileUpload";

type Manager = { id: string; name: string };

const SEVERITIES = [
  { value: "LOW", label: "Low — no immediate impact" },
  { value: "MEDIUM", label: "Medium — needs attention soon" },
  { value: "HIGH", label: "High — significant impact" },
  { value: "CRITICAL", label: "Critical — urgent, blocking work" },
];

const CONCERN_TYPES = [
  "Client-related",
  "Workload / capacity",
  "Technical / access issue",
  "Payment / billing",
  "Policy / compliance",
  "Interpersonal / team",
  "Other",
];

export default function SubmitPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [form, setForm] = useState({
    vaName: "",
    slackName: "",
    managerId: "",
    severity: "MEDIUM",
    concernType: CONCERN_TYPES[0],
    description: "",
    impact: "",
    actionsTaken: "",
    needed: "",
  });

  useEffect(() => {
    fetch("/api/managers")
      .then((r) => r.json())
      .then((data) => setManagers(data));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.managerId) {
      setError("Please select a manager to route this concern to.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, files }),
      });
      if (!res.ok) throw new Error(await res.text());
      const ticket = await res.json();
      router.push(`/ticket/${ticket.id}?submitted=1`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your concern. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">Submit a concern</h1>
      <p className="mt-1 text-sm text-brand-500">
        Fill in as much detail as you can — it helps your manager act quickly.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Your name / VA name</label>
            <input
              required
              className="input"
              value={form.vaName}
              onChange={(e) => update("vaName", e.target.value)}
              placeholder="e.g. Maria Cruz"
            />
          </div>
          <div>
            <label className="label">Slack name</label>
            <input
              required
              className="input"
              value={form.slackName}
              onChange={(e) => update("slackName", e.target.value)}
              placeholder="e.g. maria.cruz"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Manager</label>
            <select
              required
              className="input"
              value={form.managerId}
              onChange={(e) => update("managerId", e.target.value)}
            >
              <option value="">Select a manager…</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Severity / urgency</label>
            <select
              className="input"
              value={form.severity}
              onChange={(e) => update("severity", e.target.value)}
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Concern type</label>
          <select
            className="input"
            value={form.concernType}
            onChange={(e) => update("concernType", e.target.value)}
          >
            {CONCERN_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Concern description</label>
          <textarea
            required
            rows={4}
            className="input"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What happened? Be as specific as possible."
          />
        </div>

        <div>
          <label className="label">Impact</label>
          <textarea
            required
            rows={3}
            className="input"
            value={form.impact}
            onChange={(e) => update("impact", e.target.value)}
            placeholder="Who or what is this affecting, and how badly?"
          />
        </div>

        <div>
          <label className="label">Actions already taken</label>
          <textarea
            rows={3}
            className="input"
            value={form.actionsTaken}
            onChange={(e) => update("actionsTaken", e.target.value)}
            placeholder="What have you already tried or done about this?"
          />
        </div>

        <div>
          <label className="label">What is needed</label>
          <textarea
            rows={3}
            className="input"
            value={form.needed}
            onChange={(e) => update("needed", e.target.value)}
            placeholder="What support or decision do you need from your manager?"
          />
        </div>

        <div>
          <label className="label">Attachments</label>
          <FileUpload files={files} onChange={setFiles} />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Submitting…" : "Submit concern"}
        </button>
      </form>
    </div>
  );
}
