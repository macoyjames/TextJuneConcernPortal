import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { TicketDetailClient } from "./TicketDetailClient";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { submitted?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      manager: true,
      createdBy: true,
      files: true,
      statusChanges: { orderBy: { changedAt: "asc" } },
      responses: {
        orderBy: { createdAt: "asc" },
        include: {
          manager: true,
          edits: { orderBy: { editedAt: "asc" } },
        },
      },
    },
  });

  if (!ticket) notFound();

  const canRespond = user.isManager && user.managerId === ticket.managerId;

  return (
    <TicketDetailClient
      justSubmitted={searchParams.submitted === "1"}
      canRespond={canRespond}
      ticket={{
        id: ticket.id,
        vaName: ticket.vaName,
        slackName: ticket.slackName,
        managerName: ticket.manager.name,
        severity: ticket.severity,
        concernType: ticket.concernType,
        description: ticket.description,
        impact: ticket.impact,
        actionsTaken: ticket.actionsTaken,
        needed: ticket.needed,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        files: ticket.files.map((f) => ({ url: f.url, filename: f.filename })),
        statusChanges: ticket.statusChanges.map((s) => ({
          id: s.id,
          fromStatus: s.fromStatus,
          toStatus: s.toStatus,
          changedAt: s.changedAt.toISOString(),
        })),
        responses: ticket.responses.map((r) => ({
          id: r.id,
          content: r.content,
          managerName: r.manager.name,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          edited: r.edits.length > 0,
          edits: r.edits.map((e) => ({
            id: e.id,
            previousContent: e.previousContent,
            editedAt: e.editedAt.toISOString(),
          })),
        })),
      }}
    />
  );
}
