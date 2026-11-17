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
    <header className="flex min-h-16 items-center justify-end gap-3 border-b border-surface-border bg-surface px-4 py-3 sm:gap-4 sm:px-6">
      <div className="min-w-0 text-right">
        <p className="text-sm font-semibold text-surface-foreground">
          {user?.nombre ?? "Usuario"}
        </p>
        {user?.profiles?.length ? (
          <p className="mt-0.5 max-w-sm truncate text-xs text-secondary" title={user.profiles.map(profile => profile.name).join(", ")}>{user.profiles.map(profile => profile.name).join(", ")}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex shrink-0 items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-surface-subtle transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Cerrar Sesión
      </button>
    </header>
  );
}
