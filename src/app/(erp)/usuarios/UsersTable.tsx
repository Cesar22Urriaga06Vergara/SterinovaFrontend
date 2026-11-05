import { KeyRound, Pencil, ShieldCheck, UserRoundX, Users } from "lucide-react";
import type { UserRecord } from "./types";
import { userFullName } from "./types";

export function UsersTable({
  users,
  loading,
  sessionUserId,
  onEdit,
  onChangePassword,
  onToggleStatus,
}: {
  users: UserRecord[];
  loading: boolean;
  sessionUserId?: number;
  onEdit: (user: UserRecord) => void;
  onChangePassword: (user: UserRecord) => void;
  onToggleStatus: (user: UserRecord) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="rounded-lg bg-teal-50 p-2 text-sterinova-teal"><Users className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 className="font-semibold text-sterinova-dark">Cuentas registradas</h2>
          <p className="text-xs text-slate-500">{users.length} usuarios</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Rol</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Cargando usuarios…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No hay usuarios registrados.</td></tr>
            ) : users.map((user) => {
              const isSelf = user.id === sessionUserId;
              return (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sterinova-dark">{userFullName(user)}</p>
                    {user.cargo ? <p className="mt-0.5 text-xs text-slate-500">{user.cargo}</p> : null}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{user.rol}</span></td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onEdit(user)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-sterinova-dark hover:bg-slate-50">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
                      </button>
                      <button type="button" onClick={() => onChangePassword(user)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-sterinova-dark hover:bg-slate-50">
                        <KeyRound className="h-3.5 w-3.5" aria-hidden /> Contraseña
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        disabled={isSelf}
                        title={isSelf ? "No puedes desactivar tu propia cuenta" : undefined}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {user.activo ? <UserRoundX className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                        {user.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
