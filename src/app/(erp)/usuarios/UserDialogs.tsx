import { useId, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
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
    <Modal
      open
      title={editing ? "Editar usuario" : "Nuevo usuario"}
      description="Los datos de contacto se utilizan en la identificación del responsable."
      onClose={() => {
        if (!saving) onClose();
      }}
      size="lg"
      closeOnBackdrop={false}
    >
      <form noValidate onSubmit={onSubmit} className="space-y-5">
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
            <button type="button" onClick={onClose} className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary-hover disabled:opacity-60">{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}</button>
          </div>
      </form>
    </Modal>
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
    <Modal
      open
      title="Restablecer acceso"
      description={`Cuenta: ${userFullName(user)}`}
      onClose={() => {
        if (!saving) onClose();
      }}
      closeOnBackdrop={false}
    >
      <form noValidate onSubmit={onSubmit} className="space-y-5">
          {password ? <>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password-reset-link">Enlace de un solo uso</label>
            <input id="password-reset-link" readOnly value={password} className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm" />
            <p className="text-sm text-slate-600">Caduca en 15 minutos. Compártelo con la persona por un canal seguro; no vuelve a mostrarse al cerrar este diálogo.</p>
            <button type="button" onClick={() => void navigator.clipboard.writeText(password).then(() => { setCopied(true); setCopyError(""); }).catch(() => setCopyError("No se pudo copiar. Selecciona y copia el enlace manualmente."))} className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium">{copied ? "Copiado" : "Copiar enlace"}</button>
          </> : <p className="text-sm text-slate-600">Se generará un enlace aleatorio de un solo uso. La persona establecerá su propia contraseña.</p>}
          {passwordError ? <p role="alert" className="text-sm text-red-700">{passwordError}</p> : null}
          {pageError ? <p role="alert" className="text-sm text-red-700">{pageError}</p> : null}
          {copyError ? <p role="alert" className="text-sm text-red-700">{copyError}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button>
            {!password ? <button type="submit" disabled={saving} className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground disabled:opacity-60">{saving ? "Generando…" : "Generar enlace"}</button> : null}
          </div>
      </form>
    </Modal>
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
        className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2.5 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
      />
      {error ? <span id={errorId} role="alert" className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
