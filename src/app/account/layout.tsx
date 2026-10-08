import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { displayPhone } from "@/lib/validate";
import { AccountNav } from "@/components/account/AccountNav";
import { logout } from "./actions";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  return (
    <div className="container-x py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-body">My Account</p>
          <h1 className="mt-1 text-[2.25rem]">{user.name ? `Hello, ${user.name.split(" ")[0]}` : "Welcome"}</h1>
          <p className="text-[1rem] text-body">{user.phone ? displayPhone(user.phone) : user.email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="min-h-11 text-[1rem] text-ink underline decoration-accent underline-offset-4">
            Sign out
          </button>
        </form>
      </div>
      <AccountNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
