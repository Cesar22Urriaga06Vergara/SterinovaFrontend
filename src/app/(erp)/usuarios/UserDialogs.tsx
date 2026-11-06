import { useId, type FormEvent } from "react";
import type { UserForm, UserRecord } from "./types";
import { USER_ROLES, userFullName } from "./types";
import type { UserFormErrors } from "@/lib/user-validation";

export function UserFormDialog({
  editing,
  form,
  errors,
  pageError,
  saving,
  onFormChange,
  onSubmit,
  onClose,
}: {
  editing: UserRecord | null;
  form: UserForm;
  errors: UserFormErrors;
  pageError: string;
  saving: boolean;
  onFormChange: (form: UserForm, field?: keyof UserFormErrors) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation">
      <section className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 id="user-form-title" className="text-xl font-bold text-sterinova-dark">{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
          <p className="mt-1 text-sm text-slate-500">Los datos de contacto se utilizan en la identificación del responsable.</p>
        </div>
        <form noValidate onSubmit={onSubmit} className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" required maxLength={255} error={errors.nombre} value={form.nombre} onChange={(value) => onFormChange({ ...form, nombre: value }, "nombre")} />
            <Field label="Apellido" maxLength={255} value={form.apellido ?? ""} onChange={(value) => onFormChange({ ...form, apellido: value })} />
            <Field label="Cargo" maxLength={255} value={form.cargo ?? ""} onChange={(value) => onFormChange({ ...form, cargo: value })} />
            <Field label="Celular" maxLength={50} value={form.celular ?? ""} onChange={(value) => onFormChange({ ...form, celular: value })} />
            <Field label="Email de contacto" type="email" maxLength={255} error={errors.email_contacto} value={form.email_contacto ?? ""} onChange={(value) => onFormChange({ ...form, email_contacto: value }, "email_contacto")} />
            <Field label="Email de acceso" type="email" required maxLength={255} error={errors.email} value={form.email} onChange={(value) => onFormChange({ ...form, email: value }, "email")} />
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Rol</span>
              <select required value={form.rol} onChange={(event) => onFormChange({ ...form, rol: event.target.value as UserForm["rol"] })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/20">
                {USER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            {!editing ? <Field label="Contraseña inicial" type="password" required minLength={10} error={errors.password} value={form.password} onChange={(value) => onFormChange({ ...form, password: value }, "password")} /> : null}
          </div>
          {pageError ? <p role="alert" className="text-sm text-red-700">{pageError}</p> : null}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-sterinova-dark px-4 py-2 text-sm font-semibold text-white hover:bg-sterinova-teal disabled:opacity-60">{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ChangePasswordDialog({
  user,
  password,
  passwordError,
  pageError,
  saving,
  onPasswordChange,
  onSubmit,
  onClose,
}: {
  user: UserRecord;
  password: string;
  passwordError: string;
  pageError: string;
  saving: boolean;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="password-title">
        <form noValidate onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <h2 id="password-title" className="text-xl font-bold text-sterinova-dark">Cambiar contraseña</h2>
            <p className="mt-1 text-sm text-slate-500">Cuenta: {userFullName(user)}</p>
          </div>
          <Field label="Nueva contraseña" type="password" required minLength={10} error={passwordError} value={password} onChange={onPasswordChange} />
          {pageError ? <p role="alert" className="text-sm text-red-700">{pageError}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-sterinova-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Guardando…" : "Actualizar"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  minLength,
  maxLength,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
}) {
  const errorId = useId();

  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/20"
      />
      {error ? <span id={errorId} role="alert" className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
