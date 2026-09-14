const STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ESCALATED: "bg-red-50 text-red-700 border-red-200",
  RESOLVED: "bg-brand-50 text-brand-700 border-brand-200",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
