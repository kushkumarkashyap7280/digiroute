import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import NotFoundClient from "@/components/NotFoundClient";

export const metadata: Metadata = {
  title: "404 — Page Not Found | DigiRoute",
  description: "The page you are looking for does not exist.",
};

export default async function NotFound() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return <NotFoundClient isLoggedIn={isLoggedIn} />;
}
