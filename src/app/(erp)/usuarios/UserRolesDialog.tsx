"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import type { UserRecord } from "./types";
import { userFullName } from "./types";

export type RoleAssignment = { id: number; user_id: number; role_id: number; scope_id: number; active: number | boolean; role_active: number | boolean; name: string; code: string; kind: string; scope_name: string };
export type Role = { id: number; code: string; name: string; kind: string; active: boolean; global_assignable: boolean; permissions?: {code: string; label: string}[] };
export type Scope = { id: number; name: string; kind: string };

export function UserRolesDialog({ user, assignments, sessionUserId, onClose, onChanged }: {
  user: UserRecord; assignments: RoleAssignment[]; sessionUserId: number;
  onClose: () => void; onChanged: () => Promise<void>;
}) {
  const [catalog, setCatalog] = useState<{ roles: Role[]; scopes: Scope[] } | null>(null);
  const [roleId, setRoleId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const role = catalog?.roles.find(item => item.id === Number(roleId));
  const scopes = catalog?.scopes.filter(scope => role?.kind === "PLATFORM" ? scope.kind === "GLOBAL" : scope.kind !== "GLOBAL" || role?.global_assignable) ?? [];

  useEffect(() => {
    let active = true;
    api.get("/users/role-catalog").then(({ data }) => { if (active) setCatalog(data); }).catch(() => { if (active) setError("No se pudo cargar el catálogo de perfiles."); });
    return () => { active = false; };
  }, []);

  async function change(action: () => Promise<unknown>) {
    if (saving) return;
    setSaving(true); setError("");
    try { await action(); await onChanged(); }
    catch (error) { setError(axios.isAxiosError(error) && typeof error.response?.data?.message === "string" ? error.response.data.message : "No se pudo actualizar el perfil."); }
    finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="user-roles-title" className="my-auto w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
      <h2 id="user-roles-title" className="text-xl font-bold text-sterinova-dark">Roles y ámbitos de {userFullName(user)}</h2>
      <p className="text-sm text-slate-600">Los permisos se suman entre los perfiles asignados. Para cambiar un perfil, añade el nuevo y retira el anterior.</p>
      <ul className="space-y-2">
        {assignments.filter(item => item.active).map(item => <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span>{item.name} · {item.scope_name}{!item.role_active ? " (perfil inactivo)" : ""}</span>
          <button type="button" disabled={saving || item.kind === "PLATFORM" || sessionUserId === user.id} onClick={() => void change(() => api.delete(`/users/${user.id}/role-assignments/${item.id}`))} className="rounded border px-3 py-1.5 disabled:opacity-40">Quitar</button>
        </li>)}
      </ul>
      {sessionUserId === user.id && <p className="text-sm text-slate-600">Para retirar tus propios perfiles, inicia sesión con otra cuenta administradora.</p>}
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); void change(() => api.post(`/users/${user.id}/role-assignments`, { role_id: Number(roleId), scope_id: Number(scopeId) })); }}>
        <label className="block text-sm font-medium">Perfil
          <select aria-label="Perfil" required value={roleId} onChange={event => { setRoleId(event.target.value); setScopeId(""); }} className="mt-1 block w-full rounded-lg border p-2.5">
            <option value="">Selecciona un perfil</option>
            {catalog?.roles.map(item => <option key={item.id} value={item.id} disabled={!item.active}>{item.name}{!item.active ? " — inactivo" : ""}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Ámbito
          <select aria-label="Ámbito" required value={scopeId} onChange={event => setScopeId(event.target.value)} className="mt-1 block w-full rounded-lg border p-2.5">
            <option value="">Selecciona un ámbito</option>
            {scopes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border px-4 py-2">Cerrar</button>
          <button type="submit" disabled={saving || !catalog || !roleId || !scopeId} className="rounded-lg bg-sterinova-dark px-4 py-2 text-white disabled:opacity-40">{saving ? "Guardando…" : "Asignar perfil"}</button>
        </div>
      </form>
    </section>
  </div>;
}
