import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminFromCookies } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Everything under /admin requires a valid admin session. Without one the
 * response is a plain 404, so the existence of the admin area isn't advertised.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies();
  if (!admin) notFound();

  return (
    <AdminShell
      admin={{ name: admin.name, email: admin.email, role: admin.role, mustChangePassword: admin.mustChangePassword }}
    >
      {children}
    </AdminShell>
  );
}
