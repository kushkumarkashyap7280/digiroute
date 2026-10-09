import { getAdminFromCookies } from "@/lib/adminAuth";
import UsersClient from "@/components/admin/UsersClient";

export default async function UsersPage() {
  const admin = await getAdminFromCookies();
  return <UsersClient isSuper={admin?.role === "super"} />;
}
