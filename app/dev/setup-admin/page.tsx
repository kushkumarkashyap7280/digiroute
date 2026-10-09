import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { bootstrapEnabled, describeDatabase, isLocalHost } from "@/lib/adminBootstrap";
import SetupAdminForm from "@/components/admin/SetupAdminForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Setup", robots: { index: false, follow: false } };

/** Local development only — a 404 anywhere else (see lib/adminBootstrap.ts). */
export default async function SetupAdminPage() {
  const h = await headers();
  if (!bootstrapEnabled() || !isLocalHost(h.get("host"))) notFound();
  return <SetupAdminForm database={describeDatabase()} />;
}
