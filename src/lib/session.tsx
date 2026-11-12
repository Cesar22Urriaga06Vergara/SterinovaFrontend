"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type { StoredUser } from "@/lib/stored-user";

type Scope = { id: number; name: string; kind: string };
type Session = {
  user: StoredUser;
  permissions: string[];
  capabilities: { permission: string; scope_ids: number[]; own_scope_ids: number[] }[];
  current_scope: Scope | null;
  available_scopes: Scope[];
};
const SessionContext = createContext<(Session & {
  ready: boolean;
  can: (permission: string) => boolean;
  selectScope: (id: number) => void;
}) | null>(null);

const EMPTY_SESSION: Session = {
  user: {},
  permissions: [],
  capabilities: [],
  current_scope: null,
  available_scopes: [],
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState(false);
  const selected = useRef<number | undefined>(undefined);
  const generation = useRef(0);
  const refresh = useCallback(async (scopeId = selected.current) => {
    const version = ++generation.current;
    try {
      const { data } = await api.get<Session>("/auth/me", {
        headers: scopeId ? { "x-scope-id": String(scopeId) } : {},
      });
      if (version !== generation.current) return;
      setError(false);
      selected.current = data.current_scope?.id;
      setSession(data);
    } catch {
      if (version === generation.current) {
        selected.current = undefined;
        setSession(null);
        setError(true);
      }
    }
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) return refresh(); });
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.removeEventListener("focus", onFocus); };
  }, [pathname, refresh]);
  const activeSession = session ?? EMPTY_SESSION;
  const ready = Boolean(session) && !error;
  return (
    <SessionContext.Provider
      value={{
        ...activeSession,
        ready,
        can: (permission) => activeSession.permissions.includes(permission),
        selectScope: (id) => {
          setSession(null);
          void refresh(id);
        },
      }}
    >
      {error ? (
        <div role="alert" className="p-6">
          No se pudo validar la sesión.{" "}
          <button onClick={() => void refresh()}>Reintentar</button>
        </div>
      ) : !session ? (
        <div role="status" className="p-6">
          Validando sesión...
        </div>
      ) : null}
      <div
        hidden={!ready}
        aria-hidden={!ready}
        inert={!ready}
        className={!ready ? "hidden" : undefined}
      >
        {children}
      </div>
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("La vista requiere una sesión validada");
  return session;
}

export function useQuoteHeaders(): Record<string, string> {
  const { current_scope } = useSession();
  const scopeId = current_scope?.id;
  return useMemo(() => {
    const headers: Record<string, string> = {};
    if (scopeId) headers["x-scope-id"] = String(scopeId);
    return headers;
  }, [scopeId]);
}
