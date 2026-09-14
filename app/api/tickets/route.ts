import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { sendNewTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const {
    vaName,
    slackName,
    managerId,
    severity,
    concernType,
    description,
    impact,
    actionsTaken,
    needed,
    files,
  } = body;

  if (!vaName?.trim() || !slackName?.trim() || !managerId || !description?.trim() || !impact?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const manager = await prisma.manager.findUnique({ where: { id: managerId } });
  if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });

  const ticket = await prisma.ticket.create({
    data: {
      vaName: vaName.trim(),
      slackName: slackName.trim(),
      managerId,
      severity,
      concernType,
      description: description.trim(),
      impact: impact.trim(),
      actionsTaken: actionsTaken?.trim() || null,
      needed: needed?.trim() || null,
      createdById: user.id,
      files: {
        create: (files ?? []).map((f: { url: string; filename: string; size?: number; mimeType?: string }) => ({
          url: f.url,
          filename: f.filename,
          size: f.size,
          mimeType: f.mimeType,
        })),
      },
      statusChanges: {
        create: { fromStatus: null, toStatus: "PENDING" },
      },
    },
  });

  // In-app notification for the manager, if they have a user account.
  const managerUser = await prisma.user.findUnique({ where: { email: manager.email } });
  if (managerUser) {
    await prisma.notification.create({
      data: {
        userId: managerUser.id,
        ticketId: ticket.id,
        message: `New ${severity.toLowerCase()} concern from ${vaName}: ${concernType}`,
      },
    });
  }

  // Fire-and-forget email notification.
  sendNewTicketEmail({
    to: manager.email,
    managerName: manager.name,
    ticketId: ticket.id,
    vaName: vaName.trim(),
    severity,
    concernType,
  });

  return NextResponse.json(ticket);
}
