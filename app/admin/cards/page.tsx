import { getAdminFromCookies } from "@/lib/adminAuth";
import CardsClient from "@/components/admin/CardsClient";

export default async function CardsPage() {
  const admin = await getAdminFromCookies();
  return <CardsClient isSuper={admin?.role === "super"} />;
}
