import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create Free Account — DigiRoute",
  description:
    "Create your free DigiRoute account to save precise DIGIPIN entrance locations, attach doorway photos, and share direct navigation links.",
  openGraph: {
    title: "Create Your Free DigiRoute Account",
    description: "Start saving and sharing precise ~4m doorstep entrance locations with real photos.",
    url: "https://digiroute.app/signup",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
