import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const response = await prisma.response.findUnique({ where: { id: params.responseId } });
  if (!response || response.ticketId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the manager who owns this ticket's bucket may edit responses on it.
  if (!user.isManager || user.managerId !== response.managerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Response content is required" }, { status: 400 });
  }

  // Preserve the previous version, timestamped, before overwriting.
  const [, updated] = await prisma.$transaction([
    prisma.responseEdit.create({
      data: {
        responseId: response.id,
        previousContent: response.content,
      },
    }),
    prisma.response.update({
      where: { id: response.id },
      data: { content: content.trim() },
      include: { manager: true, edits: { orderBy: { editedAt: "asc" } } },
    }),
  ]);

  return NextResponse.json({
    id: updated.id,
    content: updated.content,
    managerName: updated.manager.name,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    edited: true,
    edits: updated.edits.map((e) => ({
      id: e.id,
      previousContent: e.previousContent,
      editedAt: e.editedAt.toISOString(),
    })),
  });
}
