import { notFound } from "next/navigation";
import { getAdminFromCookies } from "@/lib/adminAuth";
import AuditClient from "@/components/admin/AuditClient";

export default async function AuditPage() {
  const admin = await getAdminFromCookies();
  if (admin?.role !== "super") notFound();
  return <AuditClient />;
}
