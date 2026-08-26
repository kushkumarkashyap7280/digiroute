import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In — DigiRoute",
  description: "Sign in to your DigiRoute account to manage saved address cards and precise DIGIPIN entrance links.",
  openGraph: {
    title: "Sign In to DigiRoute",
    description: "Access your dashboard to view, share, and manage your entrance address cards.",
    url: "https://digiroute.app/login",
  },
  robots: {
    index: false, // Prevent login page indexing
    follow: true,
  },
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
