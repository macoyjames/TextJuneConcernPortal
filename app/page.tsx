import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/SignInButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect(session.user.isManager ? "/admin" : "/submit");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-800 to-brand-950 px-4 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white backdrop-blur">
        TJ
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">TextJune Concern Portal</h1>
      <p className="mt-3 max-w-md text-brand-100/80">
        Raise a concern, track it through resolution, and stay in the loop — all in one
        place.
      </p>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
        <SignInButton />
        <p className="mt-3 text-xs text-brand-500">
          Sign in with your work Gmail account to continue.
        </p>
      </div>
    </div>
  );
}
