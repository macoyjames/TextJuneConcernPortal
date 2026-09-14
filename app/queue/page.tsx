import { prisma } from "@/lib/prisma";
import { TicketList, type TicketSummary } from "@/components/TicketList";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    include: { manager: true },
  });

  const summaries: TicketSummary[] = tickets.map((t) => ({
    id: t.id,
    vaName: t.vaName,
    slackName: t.slackName,
    managerName: t.manager.name,
    severity: t.severity,
    concernType: t.concernType,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">Concern queue</h1>
      <p className="mt-1 text-sm text-brand-500">
        All submitted concerns across every manager&apos;s bucket.
      </p>
      <div className="mt-6">
        <TicketList tickets={summaries} showManagerColumn />
      </div>
    </div>
  );
}
