"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
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
import type { AdministradorArea, CrearAdministradorDto } from "@/lib/gerencia-types";

type Role = { id: number; code: string; name: string; active: boolean };
type Scope = { id: number; code: string; name: string; kind: string };
type RoleCatalogo = { roles: Role[]; scopes: Scope[] };

export default function AdministradoresPage() {
  const { can } = useSession();
  const canManage = can("gerencia.administradores.gestionar");
  const [administradores, setAdministradores] = useState<AdministradorArea[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmRemoval, setConfirmRemoval] = useState<{ userId: number; assignmentId: number } | null>(null);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cargo, setCargo] = useState("");
  const [celular, setCelular] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [scopeId, setScopeId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [adminsRes, catalogRes] = await Promise.all([
        api.get<AdministradorArea[]>("/gerencia/administradores"),
        api.get<RoleCatalogo>("/users/role-catalog"),
      ]);
      setAdministradores(adminsRes.data);
      setRoles(catalogRes.data.roles);
      setScopes(catalogRes.data.scopes);
    } catch {
      setError("No se pudieron cargar los administradores de área.");
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

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!email || !nombre || !password || !roleId || !scopeId) {
      setFormError("Todos los campos obligatorios deben completarse.");
      return;
    }
    setSaving(true);
    try {
      const dto: CrearAdministradorDto = {
        email,
        nombre,
        apellido: apellido || undefined,
        cargo: cargo || undefined,
        celular: celular || undefined,
        email_contacto: emailContacto || undefined,
        password,
        role_id: Number(roleId),
        scope_id: Number(scopeId),
      };
      await api.post("/gerencia/administradores", dto);
      setFormOpen(false);
      setEmail("");
      setNombre("");
      setApellido("");
      setCargo("");
      setCelular("");
      setEmailContacto("");
      setPassword("");
      setRoleId("");
      setScopeId("");
      await loadData();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo crear el administrador.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(userId: number, assignmentId: number) {
    setSaving(true);
    try {
      await api.delete(`/gerencia/administradores/${userId}/asignaciones/${assignmentId}`);
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
        title="Administradores de Área"
        description="Gestiona las cuentas y asignaciones de administradores por área y ámbito."
        actions={
          <Button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setFormError("");
            }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Crear Administrador
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
                <p className="text-sm font-semibold text-surface-subtle uppercase">Administradores activos</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{administradores.filter((a) => a.activo).length}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Roles disponibles</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{roles.filter((r) => r.active).length}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-semibold text-surface-subtle uppercase">Ámbitos disponibles</p>
                <p className="mt-1 text-2xl font-bold text-surface-foreground">{scopes.length}</p>
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
                    <TableState colSpan={6} message="Cargando administradores..." loading />
                  ) : administradores.length === 0 ? (
                    <TableState colSpan={6} message="No hay administradores de área registrados." />
                  ) : (
                    administradores.map((a) => (
                      <tr key={a.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-surface-subtle" aria-hidden />
                            <span>{a.nombre} {a.apellido ?? ""}</span>
                          </div>
                          <p className="text-xs text-surface-subtle">{a.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{a.rol.code}</Badge>
                        </td>
                        <td className="px-4 py-3">{a.ambito.name}</td>
                        <td className="px-4 py-3 text-surface-subtle text-xs">{a.ambito.kind}</td>
                        <td className="px-4 py-3">
                          <Badge variant={a.activo ? "success" : "neutral"}>
                            {a.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmRemoval({ userId: a.id, assignmentId: a.id })}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden /> Retirar
                          </Button>
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
              title="Crear Administrador de Área"
              description="Crea una cuenta de usuario y asigna un rol con ámbito específico."
              onClose={() => setFormOpen(false)}
              size="lg"
            >
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    error={formError && "email" ? "Requerido" : undefined}
                  />
                  <Input
                    label="Nombres"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombres"
                    error={formError && "nombre" ? "Requerido" : undefined}
                  />
                  <Input
                    label="Apellidos"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Apellidos"
                  />
                  <Input
                    label="Cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej: Jefe de Logística"
                  />
                  <Input
                    label="Celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="300 000 0000"
                  />
                  <Input
                    label="Email de contacto"
                    value={emailContacto}
                    onChange={(e) => setEmailContacto(e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 10 caracteres"
                    error={formError && "password" ? "Requerido (mín. 10 chars)" : undefined}
                  />
                  <Select
                    label="Rol"
                    options={roles.filter((r) => r.active).map((r) => ({ value: String(r.id), label: `${r.name} (${r.code})` }))}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    placeholder="Selecciona un rol"
                    error={formError && "role" ? "Requerido" : undefined}
                  />
                </div>
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
                    {saving ? "Creando..." : "Crear Administrador"}
                  </button>
                </div>
              </form>
            </Modal>
          ) : null}

          {confirmRemoval ? (
            <Modal
              open={Boolean(confirmRemoval)}
              title="Retirar asignación de administrador"
              description="¿Estás seguro de que deseas retirar esta asignación? Se conservará la cuenta del usuario y otras pertenencias."
              onClose={() => setConfirmRemoval(null)}
            >
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmRemoval(null)}>
                  Cancelar
                </Button>
                <button
                  type="button"
                  onClick={() => void handleRemove(confirmRemoval.userId, confirmRemoval.assignmentId)}
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
