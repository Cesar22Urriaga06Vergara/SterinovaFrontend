"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import { buildRolesAmbitosViewModel } from "./view-model";

type Role = { id: number; code: string; name: string; active: boolean };
type Scope = { id: number; code: string; name: string; kind: string; parentId?: number | null; active?: boolean };
type RoleCatalogo = { roles: Role[]; scopes: Scope[] };
type RoleAssignment = {
  id: number;
  user_id: number;
  role_id: number;
  scope_id: number;
  active: number | boolean;
  code: string;
  name: string;
  kind: string;
  role_active: number | boolean;
  scope_name: string;
};

type ScopeForm = { code: string; name: string; kind: "DEPARTMENT" | "TEAM" | "PLANT"; parentId: string };
const emptyScopeForm = (): ScopeForm => ({ code: "", name: "", kind: "DEPARTMENT", parentId: "" });

export default function RolesAmbitosPage() {
  const { canManageGlobal } = useSession();
  const canManageAssignments = canManageGlobal("asignaciones.gestionar");
  const canManageScopes = canManageGlobal("ambitos.gestionar");
  const canManage = canManageAssignments || canManageScopes;
  const [roles, setRoles] = useState<Role[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [asignaciones, setAsignaciones] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [scopeFormOpen, setScopeFormOpen] = useState(false);
  const [scopeForm, setScopeForm] = useState<ScopeForm>(emptyScopeForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [scopeFormError, setScopeFormError] = useState("");
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [confirmRemoval, setConfirmRemoval] = useState<{ id: number; assignmentId: number } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesRes, assignmentsRes, scopesRes] = await Promise.all([
        canManageAssignments ? api.get<RoleCatalogo>("/users/role-catalog") : Promise.resolve(null),
        canManageAssignments ? api.get<RoleAssignment[]>("/users/role-assignments") : Promise.resolve(null),
        canManageScopes ? api.get<Scope[]>("/ambitos") : Promise.resolve(null),
      ]);
      const roleData = rolesRes?.data;
      const listedScopes = Array.isArray(scopesRes?.data) ? scopesRes.data : undefined;
      const catalogScopes = Array.isArray(roleData?.scopes) ? roleData.scopes : undefined;
      const nextScopes = listedScopes?.length
        ? listedScopes
        : catalogScopes ?? listedScopes ?? [];
      setRoles(Array.isArray(roleData?.roles) ? roleData.roles : []);
      setScopes(nextScopes);
      setAsignaciones(Array.isArray(assignmentsRes?.data) ? assignmentsRes.data : []);
      const globalScope = nextScopes.find((scope) => scope.kind === "GLOBAL");
      if (globalScope) {
        setScopeForm((current) => ({
          ...current,
          parentId: current.parentId || String(globalScope.id),
        }));
      }
    } catch {
      setError("No se pudieron cargar roles, ámbitos y asignaciones.");
    } finally {
      setLoading(false);
    }
  }, [canManageAssignments, canManageScopes]);

  useEffect(() => {
    if (canManage) {
      const id = setTimeout(() => void loadData(), 0);
      return () => clearTimeout(id);
    }
  }, [canManage, loadData]);

  if (!canManage) {
    return null;
  }

  async function handleAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!userId || !roleId || !scopeId) {
      setFormError("Selecciona usuario, rol y ámbito.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/users/${userId}/role-assignments`, {
        role_id: Number(roleId),
        scope_id: Number(scopeId),
      });
      setFormOpen(false);
      setUserId("");
      setRoleId("");
      setScopeId("");
      await loadData();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo asignar el rol.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(assignmentId: number, userId: number) {
    setSaving(true);
    try {
      await api.delete(`/users/${userId}/role-assignments/${assignmentId}`);
      setConfirmRemoval(null);
      await loadData();
    } catch {
      setConfirmRemoval(null);
    } finally {
      setSaving(false);
    }
  }

  function openCreateScope() {
    const globalScope = scopes.find((scope) => scope.kind === "GLOBAL");
    setScopeForm({ ...emptyScopeForm(), parentId: String(globalScope?.id ?? 1) });
    setScopeFormError("");
    setScopeFormOpen(true);
  }

  async function handleCreateScope(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageScopes || saving) return;
    setScopeFormError("");
    if (!scopeForm.code.trim() || !scopeForm.name.trim() || !scopeForm.parentId) {
      setScopeFormError("Completa el código, el nombre y el ámbito padre.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post<Scope>("/ambitos", {
        code: scopeForm.code.trim(),
        name: scopeForm.name.trim(),
        kind: scopeForm.kind,
        parentId: scopeForm.parentId,
      });
      setScopes((current) => [...current, data]);
      setScopeFormOpen(false);
      setScopeForm(emptyScopeForm());
      await loadData();
    } catch (cause) {
      setScopeFormError(cause instanceof Error ? cause.message : "No se pudo crear el ámbito.");
    } finally {
      setSaving(false);
    }
  }

  const view = buildRolesAmbitosViewModel(scopes, canManageScopes);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Roles y Ámbitos"
        description="Administra ámbitos y asignaciones según tus permisos globales."
        actions={(
          <div className="flex flex-wrap gap-2">
          {view.showCreateScope ? <Button type="button" variant="secondary" onClick={openCreateScope}>
            <Plus className="h-4 w-4" aria-hidden /> {view.createScopeLabel}
          </Button> : null}
          {canManageAssignments ? <Button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setFormError("");
            }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Asignar Rol
          </Button> : null}
          </div>
        )}
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Roles activos</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{roles.filter((r) => r.active).length}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Ámbitos</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{view.scopeCount}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Asignaciones activas</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{asignaciones.filter((a) => Number(a.active) === 1 && Number(a.role_active) === 1).length}</p>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Usuario</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Rol</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Ámbito</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Tipo ámbito</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Estado</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? (
                    <TableState colSpan={6} message="Cargando asignaciones..." loading />
                  ) : asignaciones.length === 0 ? (
                    <TableState colSpan={6} message="No hay asignaciones de roles registradas." />
                  ) : (
                    asignaciones.map((a) => (
                      <tr key={a.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          Usuario #{a.user_id}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{a.code}</Badge>
                        </td>
                        <td className="px-4 py-3">{a.scope_name}</td>
                        <td className="px-4 py-3 text-surface-subtle text-xs">
                          {a.kind}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={Number(a.active) === 1 && Number(a.role_active) === 1 ? "success" : "neutral"}>
                            {Number(a.active) === 1 && Number(a.role_active) === 1 ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {a.id !== 0 && Number(a.active) === 1 && Number(a.role_active) === 1 ? (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => setConfirmRemoval({ id: a.user_id, assignmentId: a.id })}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden /> Retirar
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-surface-border px-6 py-4">
              <h2 className="font-semibold text-surface-foreground">Ámbitos registrados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Código</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Nombre</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? <TableState colSpan={4} message="Cargando ámbitos..." loading /> : view.scopeCount === 0 ? (
                    <TableState colSpan={4} message="No hay ámbitos registrados. Crea el primer ámbito operativo." />
                  ) : scopes.map((scope) => (
                    <tr key={scope.id}>
                      <td className="px-4 py-3 font-mono">{scope.code}</td>
                      <td className="px-4 py-3">{scope.name}</td>
                      <td className="px-4 py-3">{scope.kind}</td>
                      <td className="px-4 py-3">{scope.active === false ? "Inactivo" : "Activo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {formOpen && canManage ? (
            <Modal
              open={formOpen}
              title="Asignar rol a usuario"
              onClose={() => setFormOpen(false)}
              size="lg"
            >
              <form onSubmit={handleAssign} className="space-y-4">
                <Input
                  label="ID de usuario"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  error={formError && "user" ? "Requerido" : undefined}
                />
                <Select
                  label="Rol"
                  options={roles.filter((r) => r.active).map((r) => ({ value: String(r.id), label: `${r.name} (${r.code})` }))}
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  placeholder="Selecciona un rol"
                  error={formError && "role" ? "Requerido" : undefined}
                />
                <Select
                  label="Ámbito"
                  options={view.scopeOptions}
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  placeholder="Selecciona un ámbito"
                  error={formError && "scope" ? "Requerido" : undefined}
                />
                {formError && (
                  <p role="alert" className="text-sm text-error">{formError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                  >
                    {saving ? "Asignando..." : "Asignar Rol"}
                  </button>
                </div>
              </form>
            </Modal>
          ) : null}

          {scopeFormOpen && canManageScopes ? (
            <Modal open title="Crear ámbito operativo" onClose={() => { if (!saving) setScopeFormOpen(false); }}>
              <form onSubmit={handleCreateScope} className="space-y-4">
                <Input label="Código" required maxLength={100} value={scopeForm.code} onChange={(event) => setScopeForm((current) => ({ ...current, code: event.target.value }))} />
                <Input label="Nombre" required maxLength={160} value={scopeForm.name} onChange={(event) => setScopeForm((current) => ({ ...current, name: event.target.value }))} />
                <Select label="Tipo de ámbito" options={[
                  { value: "DEPARTMENT", label: "Departamento" },
                  { value: "TEAM", label: "Equipo" },
                  { value: "PLANT", label: "Planta" },
                ]} value={scopeForm.kind} onChange={(event) => setScopeForm((current) => ({ ...current, kind: event.target.value as ScopeForm["kind"] }))} />
                <Select label="Ámbito padre" options={view.parentScopeOptions} value={scopeForm.parentId} onChange={(event) => setScopeForm((current) => ({ ...current, parentId: event.target.value }))} placeholder="Selecciona un ámbito padre" />
                {scopes.length === 0 ? <p className="text-sm text-surface-subtle">El ámbito global raíz será el padre del primer ámbito operativo.</p> : null}
                {scopeFormError ? <p role="alert" className="text-sm text-error">{scopeFormError}</p> : null}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setScopeFormOpen(false)} disabled={saving}>Cancelar</Button>
                  <Button type="submit" loading={saving} disabled={saving}>Crear ámbito</Button>
                </div>
              </form>
            </Modal>
          ) : null}

          {confirmRemoval ? (
            <Modal
              open={Boolean(confirmRemoval)}
              title="Retirar asignación de rol"
              description="¿Estás seguro de que deseas retirar esta asignación? Se conservará la cuenta del usuario."
              onClose={() => setConfirmRemoval(null)}
            >
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmRemoval(null)}>
                  Cancelar
                </Button>
                <button
                  type="button"
                  onClick={() => void handleRemove(confirmRemoval.assignmentId, confirmRemoval.id)}
                  disabled={saving}
                  className="rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-error-foreground disabled:opacity-70"
                >
                  {saving ? "Retirando..." : "Confirmar retiro"}
                </button>
              </div>
            </Modal>
          ) : null}
        </>
      )}
    </div>
  );
}
