import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ManagersClient } from "./ManagersClient";

export const dynamic = "force-dynamic";

export default async function ManagersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (!user.isSuperAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-brand-950">Not authorized</h1>
        <p className="mt-2 text-sm text-brand-500">
          Only super admins (set via SUPER_ADMIN_EMAILS) can manage the manager list.
        </p>
      </div>
    );
  }

  const managers = await prisma.manager.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">Manage managers</h1>
      <p className="mt-1 text-sm text-brand-500">
        Add the managers who should appear in the concern form and receive tickets in their
        queue. A manager's queue is matched by the Gmail address they sign in with.
      </p>
      <ManagersClient
        initialManagers={managers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          active: m.active,
        }))}
      />
    </div>
  );
}
