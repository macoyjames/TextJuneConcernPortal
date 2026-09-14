import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const email = user.email?.toLowerCase() ?? "";
        const manager = await prisma.manager.findUnique({ where: { email } });

        session.user.isManager = !!manager && manager.active;
        session.user.managerId = manager?.id ?? null;
        session.user.managerName = manager?.name ?? null;
        session.user.isSuperAdmin = superAdminEmails.includes(email);
      }
      return session;
    },
  },
};
