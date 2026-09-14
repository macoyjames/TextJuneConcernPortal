import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isManager: boolean;
      managerId: string | null;
      managerName: string | null;
      isSuperAdmin: boolean;
    };
  }
}
