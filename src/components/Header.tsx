"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/lib/session";

export function Header() {
  const router = useRouter();
  const { user } = useSession();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-sterinova-dark/5 bg-white px-6 shadow-sm">
      <div className="text-right">
        <p className="text-sm font-semibold text-sterinova-dark">
          {user?.nombre ?? "Usuario"}
        </p>
        {user?.profiles?.length ? (
          <p className="text-xs text-secondary">{user.profiles?.map(profile => profile.name).join(" · ")}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-lg border border-sterinova-dark/10 px-3 py-2 text-sm font-medium text-sterinova-dark transition hover:bg-sterinova-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Cerrar Sesión
      </button>
    </header>
  );
}
