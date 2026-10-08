import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentUser, isStaff } from "@/lib/auth/session";
import { isDbConfigured } from "@/lib/env";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Role-protected: only users with role staff/admin. Everyone else gets a 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isDbConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStaff(user)) notFound();
  return (
    <div className="admin-shell bg-paper-soft pb-16">
      <AdminNav />
      <div className="container-x py-6">{children}</div>
    </div>
  );
}
