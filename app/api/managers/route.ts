import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const managers = await prisma.manager.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(managers);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { name, email } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  try {
    const manager = await prisma.manager.create({
      data: { name: name.trim(), email: email.trim().toLowerCase() },
    });
    return NextResponse.json(manager);
  } catch {
    return NextResponse.json({ error: "A manager with that name or email already exists" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id, active } = await req.json();
  const manager = await prisma.manager.update({ where: { id }, data: { active } });
  return NextResponse.json(manager);
}
