import { notFound } from "next/navigation";
import { getAdminFromCookies } from "@/lib/adminAuth";
import AdminsClient from "@/components/admin/AdminsClient";

export default async function AdminsPage() {
  const admin = await getAdminFromCookies();
  if (admin?.role !== "super") notFound();
  return <AdminsClient />;
}
