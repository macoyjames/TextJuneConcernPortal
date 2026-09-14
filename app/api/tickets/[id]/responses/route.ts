import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!user.isManager || user.managerId !== ticket.managerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Response content is required" }, { status: 400 });
  }

  const response = await prisma.response.create({
    data: {
      ticketId: ticket.id,
      managerId: user.managerId,
      content: content.trim(),
    },
    include: { manager: true, edits: true },
  });

  // Bump the ticket's updatedAt so it surfaces at the top of "recent activity".
  await prisma.ticket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } });

  // Notify the concern's submitter that a response was posted.
  await prisma.notification.create({
    data: {
      userId: ticket.createdById,
      ticketId: ticket.id,
      message: `${response.manager.name} responded to your concern: ${ticket.concernType}`,
    },
  });

  return NextResponse.json({
    id: response.id,
    content: response.content,
    managerName: response.manager.name,
    createdAt: response.createdAt.toISOString(),
    updatedAt: response.updatedAt.toISOString(),
    edited: false,
    edits: [],
  });
}
