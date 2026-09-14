"use client";

import { useState } from "react";

type ManagerRow = { id: string; name: string; email: string; active: boolean };

export function ManagersClient({ initialManagers }: { initialManagers: ManagerRow[] }) {
  const [managers, setManagers] = useState(initialManagers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addManager(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setManagers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setEmail("");
    } catch (err) {
      setError("Could not add manager. Check that the email isn't already used.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));
    await fetch(`/api/managers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={addManager} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Name</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="label">Gmail address</label>
          <input
            required
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button disabled={saving} className="btn-primary sm:w-auto">
          {saving ? "Adding…" : "Add manager"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card divide-y divide-brand-50">
        {managers.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-brand-900">{m.name}</p>
              <p className="text-xs text-brand-400">{m.email}</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-brand-600">
              <input
                type="checkbox"
                checked={m.active}
                onChange={(e) => toggleActive(m.id, e.target.checked)}
              />
              Active
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
