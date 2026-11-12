import { useId, useState, type FormEvent } from "react";
import type { UserForm, UserRecord } from "./types";
import { userFullName } from "./types";
import type { Role, Scope } from "./UserRolesDialog";
import type { UserFormErrors } from "@/lib/user-validation";

export function UserFormDialog({
  editing,
  catalog,
  form,
  errors,
  pageError,
  saving,
  onFormChange,
  onSubmit,
  onClose,
}: {
  editing: UserRecord | null;
  catalog: { roles: Role[]; scopes: Scope[] };
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
            {!editing ? <>
              <label className="block text-sm font-medium text-slate-700">Rol
                <select aria-label="Rol" value={form.role_id} onChange={event => onFormChange({ ...form, role_id: event.target.value, scope_id: "" })} className="mt-1.5 block w-full rounded-lg border p-2.5" required>
                  <option value="">Selecciona un perfil</option>
                  {catalog.roles.map(role => <option key={role.id} value={role.id} disabled={!role.active}>{role.name}{!role.active ? " — inactivo" : ""}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">Ámbito inicial
                <select aria-label="Ámbito inicial" value={form.scope_id} onChange={event => onFormChange({ ...form, scope_id: event.target.value })} className="mt-1.5 block w-full rounded-lg border p-2.5" required>
                  <option value="">Selecciona un ámbito</option>
                  {catalog.scopes.filter(scope => { const role = catalog.roles.find(role => role.id === Number(form.role_id)); return role?.kind === "PLATFORM" ? scope.kind === "GLOBAL" : scope.kind !== "GLOBAL" || role?.global_assignable; }).map(scope => <option key={scope.id} value={scope.id}>{scope.name}</option>)}
                </select>
              </label>
            </> : null}
            {!editing && form.role_id ? <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3 text-sm"><p className="font-medium">Responsabilidades del rol</p><ul className="mt-2 list-disc pl-5">{catalog.roles.find(role => role.id === Number(form.role_id))?.permissions?.map(permission => <li key={permission.code}>{permission.label}</li>)}</ul></div> : null}
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

export function ResetAccessDialog({
  user,
  password,
  passwordError,
  pageError,
  saving,
  onSubmit,
  onClose,
}: {
  user: UserRecord;
  password: string;
  passwordError: string;
  pageError: string;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="password-title">
        <form noValidate onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <h2 id="password-title" className="text-xl font-bold text-sterinova-dark">Restablecer acceso</h2>
            <p className="mt-1 text-sm text-slate-500">Cuenta: {userFullName(user)}</p>
          </div>
          {password ? <>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password-reset-link">Enlace de un solo uso</label>
            <input id="password-reset-link" readOnly value={password} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <p className="text-sm text-slate-600">Caduca en 15 minutos. Compártelo con la persona por un canal seguro; no vuelve a mostrarse al cerrar este diálogo.</p>
            <button type="button" onClick={() => void navigator.clipboard.writeText(password).then(() => { setCopied(true); setCopyError(""); }).catch(() => setCopyError("No se pudo copiar. Selecciona y copia el enlace manualmente."))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">{copied ? "Copiado" : "Copiar enlace"}</button>
          </> : <p className="text-sm text-slate-600">Se generará un enlace aleatorio de un solo uso. La persona establecerá su propia contraseña.</p>}
          {passwordError ? <p role="alert" className="text-sm text-red-700">{passwordError}</p> : null}
          {pageError ? <p role="alert" className="text-sm text-red-700">{pageError}</p> : null}
          {copyError ? <p role="alert" className="text-sm text-red-700">{copyError}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button>
            {!password ? <button type="submit" disabled={saving} className="rounded-lg bg-sterinova-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Generando…" : "Generar enlace"}</button> : null}
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
