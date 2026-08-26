import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard — DigiRoute", description: "Manage your saved DigiRoute address cards." };

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <DashboardClient userName={session.name} />;
}
