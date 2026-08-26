"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if user already dismissed/installed during this session
    const hasHandled = sessionStorage.getItem("digiroute_pwa_prompted");
    if (hasHandled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      sessionStorage.setItem("digiroute_pwa_prompted", "true");

      toast("Install DigiRoute App", {
        description: "Install on your home screen for quick 1-tap DIGIPIN access & offline maps.",
        icon: <Download className="w-5 h-5 text-orange-500" style={{ color: "var(--orange)" }} />,
        duration: 12000,
        action: {
          label: "Install",
          onClick: async () => {
            if (!deferredPromptRef.current) return;
            await deferredPromptRef.current.prompt();
            const choice = await deferredPromptRef.current.userChoice;
            if (choice.outcome === "accepted") {
              toast.success("DigiRoute installed successfully!");
            }
            deferredPromptRef.current = null;
          },
        },
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
