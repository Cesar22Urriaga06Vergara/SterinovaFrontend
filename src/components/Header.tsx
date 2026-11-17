"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/lib/session";
import { Select } from "@/components/ui/Select";

export function Header() {
  const router = useRouter();
  const { user, current_scope, available_scopes, selectScope } = useSession();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.replace("/login");
  }

  const scopeOptions = available_scopes.map((scope) => ({
    value: String(scope.id),
    label: `${scope.name} (${scope.kind})`,
  }));

  const hasGlobalScope = available_scopes.some((s) => s.kind === "GLOBAL");
  const hasMultipleScopes = available_scopes.length > 1;
  const showScopeSelector = !hasGlobalScope && hasMultipleScopes;

  return (
    <header className="flex min-h-16 items-center justify-end gap-3 border-b border-surface-border bg-surface px-4 py-3 sm:gap-4 sm:px-6">
      <div className="min-w-0 text-right">
        <p className="text-sm font-semibold text-surface-foreground">
          {user?.nombre ?? "Usuario"}
        </p>
        {user?.profiles?.length ? (
          <p className="mt-0.5 max-w-sm truncate text-xs text-secondary" title={user.profiles.map(profile => profile.name).join(", ")}>{user.profiles.map(profile => profile.name).join(", ")}</p>
        ) : null}
        {showScopeSelector && current_scope ? (
          <p className="mt-0.5 text-xs text-surface-subtle">
            Ámbito: {current_scope.name}
          </p>
        ) : null}
      </div>

      {showScopeSelector ? (
        <Select
          label="Ámbito"
          options={scopeOptions}
          value={current_scope?.id ? String(current_scope.id) : ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            if (!isNaN(id)) {
              selectScope(id);
            }
          }}
          placeholder="Selecciona ámbito"
          className="w-auto min-w-[200px]"
        />
      ) : null}

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
