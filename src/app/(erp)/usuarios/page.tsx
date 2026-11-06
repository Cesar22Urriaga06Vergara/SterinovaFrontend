"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useStoredUser } from "@/lib/stored-user-hook";
import { ChangePasswordDialog, UserFormDialog } from "./UserDialogs";
import { UsersTable } from "./UsersTable";
import { blankUserForm, type UserForm, type UserRecord, userFullName } from "./types";
import {
  getPasswordValidationError,
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
  const sessionUser = useStoredUser();
  const [users, setUsers] = useState<UserRecord[]>([]);
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
  const [passwordError, setPasswordError] = useState("");

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get<UserRecord[]>("/users");
    return data;
  }, []);

  const loadUsers = useCallback(async () => {
    setPageError("");
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      setPageError(errorMessage(error, "No se pudieron cargar los usuarios."));
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    let active = true;
    fetchUsers()
      .then((data) => {
        if (active) setUsers(data);
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
  }, [fetchUsers]);

  function openCreate() {
    setEditing(null);
    setForm(blankUserForm());
    setFieldErrors({});
    setPageError("");
    setFormOpen(true);
  }

  function openEdit(user: UserRecord) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      apellido: user.apellido ?? "",
      cargo: user.cargo ?? "",
      celular: user.celular ?? "",
      email_contacto: user.email_contacto ?? "",
      email: user.email,
      rol: user.rol,
      password: "",
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

    setSaving(true);
    const userData = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      cargo: form.cargo.trim() || null,
      celular: form.celular.trim() || null,
      email_contacto: form.email_contacto.trim() || null,
      email: form.email.trim(),
      rol: form.rol,
    };
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, userData);
        setNotice(`Se guardaron los cambios de ${userFullName(editing)}.`);
      } else {
        await api.post("/users", { ...userData, password: form.password });
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

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordUser) return;
    const validationError = getPasswordValidationError(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setSaving(true);
    setPageError("");
    setPasswordError("");
    try {
      await api.patch(`/users/${passwordUser.id}/password`, { password: newPassword });
      setNotice(`Se actualizó la contraseña de ${userFullName(passwordUser)}.`);
      setPasswordUser(null);
      setNewPassword("");
    } catch (error) {
      setPageError(errorMessage(error, "No se pudo cambiar la contraseña."));
    } finally {
      setSaving(false);
    }
  }

  if (sessionUser?.rol !== "Admin") {
    return <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm">Solo un administrador puede gestionar usuarios.</section>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sterinova-teal">Administración</p>
          <h1 className="mt-1 text-3xl font-bold text-sterinova-dark">Usuarios</h1>
          <p className="mt-2 text-sm text-slate-600">Cuentas, datos de contacto y permisos de acceso al ERP.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-sterinova-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sterinova-teal">
          <Plus className="h-4 w-4" aria-hidden /> Nuevo Usuario
        </button>
      </header>

      {pageError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}

      <UsersTable
        users={users}
        loading={loading}
        sessionUserId={sessionUser.id}
        onEdit={openEdit}
        onChangePassword={(user) => {
          setPasswordUser(user);
          setNewPassword("");
          setPasswordError("");
          setPageError("");
        }}
        onToggleStatus={(user) => void toggleStatus(user)}
      />

      {formOpen ? (
        <UserFormDialog
          editing={editing}
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
        <ChangePasswordDialog
          user={passwordUser}
          passwordError={passwordError}
          password={newPassword}
          pageError={pageError}
          saving={saving}
          onPasswordChange={(value) => { setNewPassword(value); setPasswordError(""); }}
          onSubmit={(event) => void savePassword(event)}
          onClose={() => { setPasswordUser(null); setPasswordError(""); }}
        />
      ) : null}
    </div>
  );
}
