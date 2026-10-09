import { notFound } from "next/navigation";
import { getAdminFromCookies } from "@/lib/adminAuth";
import AccountClient from "@/components/admin/AccountClient";

export default async function AccountPage() {
  const admin = await getAdminFromCookies();
  if (!admin) notFound();
  return <AccountClient name={admin.name} email={admin.email} role={admin.role} mustChange={admin.mustChangePassword} />;
}
