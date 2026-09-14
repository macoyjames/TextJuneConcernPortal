import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TextJune Concern Portal",
  description: "Submit, track, and resolve concerns.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          {session?.user && <Navbar user={session.user} />}
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
