import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { TicketList, type TicketSummary } from "@/components/TicketList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (!user.isManager || !user.managerId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-brand-950">Manager access required</h1>
        <p className="mt-2 text-sm text-brand-500">
          Your account isn&apos;t set up as a manager yet. If you believe this is a mistake,
          ask an admin to add you on the{" "}
          <Link href="/admin/managers" className="text-brand-700 underline">
            Manage Managers
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { managerId: user.managerId },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">My queue</h1>
          <p className="mt-1 text-sm text-brand-500">
            Concerns routed to you, {user.managerName}.
          </p>
        </div>
        {user.isSuperAdmin && (
          <Link href="/admin/managers" className="btn-secondary text-sm">
            Manage managers
          </Link>
        )}
      </div>
      <div className="mt-6">
        <TicketList tickets={summaries} />
      </div>
    </div>
  );
}
