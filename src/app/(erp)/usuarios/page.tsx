"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ResetAccessDialog, UserFormDialog } from "./UserDialogs";
import { UsersTable } from "./UsersTable";
import { UserRolesDialog, type RoleAssignment, type Role, type Scope } from "./UserRolesDialog";
import { blankUserForm, type UserForm, type UserRecord, userFullName } from "./types";
import {
  type UserFormErrors,
  validateUserForm,
} from "@/lib/user-validation";

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default function UsersPage() {
  const { user: sessionUser, can } = useSession();
  const canViewUsers = can("usuarios.ver");
  const canManageIdentity = can("usuarios.identidad.gestionar");
  const canManageAssignments = can("asignaciones.gestionar");
  const canCreateUsers = canManageIdentity && canManageAssignments;
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [rolesUser, setRolesUser] = useState<UserRecord | null>(null);
  const [catalog, setCatalog] = useState<{ roles: Role[]; scopes: Scope[] }>({ roles: [], scopes: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<UserForm>(blankUserForm);
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});
  const [passwordUser, setPasswordUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!canViewUsers) throw new Error("No tienes permiso para consultar usuarios.");
    const [accounts, profiles, roleCatalog] = await Promise.all([
      api.get<UserRecord[]>("/users"),
      canManageAssignments
        ? api.get<RoleAssignment[]>("/users/role-assignments")
        : Promise.resolve({ data: [] as RoleAssignment[] }),
      canManageAssignments
        ? api.get<{ roles: Role[]; scopes: Scope[] }>("/users/role-catalog")
        : Promise.resolve({ data: { roles: [], scopes: [] } }),
    ]);
    return { users: accounts.data, assignments: profiles.data, catalog: roleCatalog.data };
  }, [canManageAssignments, canViewUsers]);

  const loadUsers = useCallback(async () => {
    setPageError("");
    try {
      const data = await fetchUsers();
      setUsers(data.users);
      setAssignments(data.assignments);
      setCatalog(data.catalog);
    } catch (error) {
      setPageError(errorMessage(error, "No se pudieron cargar los usuarios."));
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    if (!canViewUsers) return;
    let active = true;
    fetchUsers()
      .then((data) => {
        if (active) { setUsers(data.users); setAssignments(data.assignments); setCatalog(data.catalog); }
      })
      .catch((error: unknown) => {
        if (active) {
          setPageError(errorMessage(error, "No se pudieron cargar los usuarios."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canViewUsers, fetchUsers]);

  function openCreate() {
    if (!canCreateUsers) return;
    setEditing(null);
    setForm(blankUserForm());
    setFieldErrors({});
    setPageError("");
    setFormOpen(true);
  }

  function openEdit(user: UserRecord) {
    if (!canManageIdentity) return;
    setEditing(user);
    setForm({
      nombre: user.nombre,
      apellido: user.apellido ?? "",
      cargo: user.cargo ?? "",
      celular: user.celular ?? "",
      email_contacto: user.email_contacto ?? "",
      email: user.email,
      password: "",
      role_id: "",
      scope_id: "",
    });
    setFieldErrors({});
    setPageError("");
    setFormOpen(true);
  }

  function updateForm(nextForm: UserForm, field?: keyof UserFormErrors) {
    setForm(nextForm);
    if (field) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");
    const errors = validateUserForm(form, Boolean(editing));
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!editing && (!form.role_id || !form.scope_id)) { setPageError("Selecciona un rol y su ámbito."); return; }

    setSaving(true);
    const userData = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      cargo: form.cargo.trim() || null,
      celular: form.celular.trim() || null,
      email_contacto: form.email_contacto.trim() || null,
      email: form.email.trim(),
    };
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, userData);
        setNotice(`Se guardaron los cambios de ${userFullName(editing)}.`);
      } else {
        await api.post("/users", { ...userData, password: form.password, role_id: Number(form.role_id), scope_id: Number(form.scope_id) });
        setNotice(`Se creó el usuario ${form.nombre.trim()}.`);
      }
      setFormOpen(false);
      await loadUsers();
    } catch (error) {
      setPageError(errorMessage(error, "No se pudieron guardar los datos del usuario."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: UserRecord) {
    setPageError("");
    setNotice("");
    try {
      await api.patch(`/users/${user.id}/status`, { activo: !user.activo });
      setNotice(`${userFullName(user)} quedó ${user.activo ? "desactivado" : "activado"}.`);
      await loadUsers();
    } catch (error) {
      setPageError(errorMessage(error, "No se pudo cambiar el estado de la cuenta."));
    }
  }

  async function savePassword() {
    if (!passwordUser) return;
    setSaving(true);
    setPageError("");
    try {
      const { data } = await api.patch<{ reset_token: string }>(
        `/users/${passwordUser.id}/password/reset`,
      );
      const url = new URL("/reset-password", window.location.origin);
      url.hash = `token=${encodeURIComponent(data.reset_token)}`;
      setNewPassword(url.href);
      setNotice(`Se generó un enlace de un solo uso para ${userFullName(passwordUser)}.`);
    } catch (error) {
      setPageError(errorMessage(error, "No se pudo iniciar el restablecimiento."));
    } finally {
      setSaving(false);
    }
  }

  if (!canViewUsers) {
    return <section role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm">No tienes permiso para consultar usuarios.</section>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sterinova-teal">Administración</p>
          <h1 className="mt-1 text-3xl font-bold text-sterinova-dark">Usuarios</h1>
          <p className="mt-2 text-sm text-slate-600">Cuentas, datos de contacto y permisos de acceso al ERP.</p>
        </div>
        {canCreateUsers ? <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-sterinova-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sterinova-teal">
          <Plus className="h-4 w-4" aria-hidden /> Nuevo Usuario
        </button> : null}
      </header>

      {pageError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}

      <UsersTable
        users={users}
        loading={loading}
        sessionUserId={sessionUser.id}
        onEdit={openEdit}
        assignments={assignments}
        onRoles={setRolesUser}
        canManageIdentity={canManageIdentity}
        canManageAssignments={canManageAssignments}
        onChangePassword={(user) => {
          if (!canManageIdentity) return;
          setPasswordUser(user);
          setNewPassword("");
          setPageError("");
        }}
        onToggleStatus={(user) => void toggleStatus(user)}
      />

      {rolesUser && canManageAssignments && <UserRolesDialog user={rolesUser} assignments={assignments.filter(item => item.user_id === rolesUser.id)} sessionUserId={sessionUser.id ?? 0} onClose={() => setRolesUser(null)} onChanged={loadUsers} />}

      {formOpen ? (
        <UserFormDialog
          editing={editing}
          catalog={catalog}
          form={form}
          errors={fieldErrors}
          pageError={pageError}
          saving={saving}
          onFormChange={updateForm}
          onSubmit={(event) => void saveUser(event)}
          onClose={() => { setFormOpen(false); setFieldErrors({}); }}
        />
      ) : null}

      {passwordUser ? (
        <ResetAccessDialog
          user={passwordUser}
          passwordError=""
          password={newPassword}
          pageError={pageError}
          saving={saving}
          onSubmit={(event) => { event.preventDefault(); void savePassword(); }}
          onClose={() => { setPasswordUser(null); setNewPassword(""); }}
        />
      ) : null}
    </div>
  );
}
