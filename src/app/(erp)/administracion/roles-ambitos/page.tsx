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

type Role = { id: number; code: string; name: string; active: boolean };
type Scope = { id: number; code: string; name: string; kind: string };
type RoleCatalogo = { roles: Role[]; scopes: Scope[] };
type RoleAssignment = {
  id: number;
  user_id: number;
  user: { id: number; nombre: string; apellido?: string | null; email: string };
  role: Role;
  scope: Scope;
  activo: boolean;
};

export default function RolesAmbitosPage() {
  const { can } = useSession();
  const canManage = can("roles.gestionar") || can("ambitos.gestionar");
  const [roles, setRoles] = useState<Role[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [asignaciones, setAsignaciones] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [confirmRemoval, setConfirmRemoval] = useState<{ id: number; assignmentId: number } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesRes, assignmentsRes] = await Promise.all([
        api.get<RoleCatalogo>("/users/role-catalog"),
        api.get<RoleAssignment[]>("/users/role-assignments"),
      ]);
      setRoles(rolesRes.data.roles);
      setScopes(rolesRes.data.scopes);
      setAsignaciones(assignmentsRes.data ?? []);
    } catch {
      setError("No se pudieron cargar roles, ámbitos y asignaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Roles y Ámbitos"
        description="Catálogo de roles activos y asignaciones de usuarios a ámbitos. Solo SuperAdmin."
        actions={
          <Button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setFormError("");
            }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Asignar Rol
          </Button>
        }
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
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{scopes.length}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Asignaciones activas</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{asignaciones.filter((a) => a.activo).length}</p>
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
                          {a.user.nombre} {a.user.apellido ?? ""} ({a.user.email})
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{a.role.code}</Badge>
                        </td>
                        <td className="px-4 py-3">{a.scope.name}</td>
                        <td className="px-4 py-3 text-surface-subtle text-xs">
                          {a.scope.kind}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={a.activo ? "success" : "neutral"}>
                            {a.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {a.activo ? (
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
                  options={scopes.map((s) => ({ value: String(s.id), label: `${s.name} (${s.kind})` }))}
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
