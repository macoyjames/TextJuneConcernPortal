import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!user.isManager || user.managerId !== ticket.managerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["PENDING", "ESCALATED", "RESOLVED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      status,
      statusChanges: {
        create: { fromStatus: ticket.status, toStatus: status },
      },
    },
    include: { statusChanges: { orderBy: { changedAt: "asc" } } },
  });

  return NextResponse.json({
    status: updated.status,
    updatedAt: updated.updatedAt.toISOString(),
    statusChanges: updated.statusChanges.map((s) => ({
      id: s.id,
      fromStatus: s.fromStatus,
      toStatus: s.toStatus,
      changedAt: s.changedAt.toISOString(),
    })),
  });
}
