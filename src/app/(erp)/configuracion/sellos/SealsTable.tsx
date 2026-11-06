import Image from "next/image";
import { ArrowDown, ArrowUp, BadgeCheck, ImagePlus, ShieldCheck, ShieldOff } from "lucide-react";

export type SealRecord = {
  id: number;
  nombre_norma: string;
  numero_licencia: string;
  imagen_key: string;
  activo: boolean;
  orden: number;
};

export function SealsTable({
  seals,
  imageUrls,
  loading,
  saving,
  onMove,
  onToggle,
}: {
  seals: SealRecord[];
  imageUrls: Record<number, string>;
  loading: boolean;
  saving: boolean;
  onMove: (id: number, direction: -1 | 1) => void;
  onToggle: (seal: SealRecord) => void;
}) {
  const orderedSeals = [...seals].sort((a, b) => a.orden - b.orden || a.id - b.id);

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="rounded-lg bg-teal-50 p-2 text-sterinova-teal"><BadgeCheck className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 className="font-semibold text-sterinova-dark">Catálogo de sellos</h2>
          <p className="text-xs text-slate-500">{seals.length} sellos · se usan los activos al emitir un documento</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-24 px-5 py-3 font-semibold">Imagen</th>
              <th className="px-5 py-3 font-semibold">Norma</th>
              <th className="px-5 py-3 font-semibold">Número de licencia</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Orden</th>
              <th className="px-5 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Cargando sellos…</td></tr>
            ) : orderedSeals.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Todavía no se han cargado sellos.</td></tr>
            ) : orderedSeals.map((seal, index) => (
              <tr key={seal.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  {imageUrls[seal.id] ? <Image src={imageUrls[seal.id]} alt={`Sello ${seal.nombre_norma}`} width={80} height={56} unoptimized className="h-14 w-20 rounded-md border border-slate-200 bg-white object-contain p-1" /> : <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-400"><ImagePlus className="h-5 w-5" aria-hidden /></div>}
                </td>
                <td className="px-5 py-4 font-semibold text-sterinova-dark">{seal.nombre_norma}</td>
                <td className="px-5 py-4 text-slate-600">{seal.numero_licencia}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${seal.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{seal.activo ? "Activo" : "Inactivo"}</span></td>
                <td className="px-5 py-4 tabular-nums text-slate-600">{seal.orden}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onMove(seal.id, -1)} disabled={saving || index === 0} aria-label={`Subir ${seal.nombre_norma}`} title="Subir" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ArrowUp className="h-4 w-4" aria-hidden /></button>
                    <button type="button" onClick={() => onMove(seal.id, 1)} disabled={saving || index === orderedSeals.length - 1} aria-label={`Bajar ${seal.nombre_norma}`} title="Bajar" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ArrowDown className="h-4 w-4" aria-hidden /></button>
                    <button type="button" onClick={() => onToggle(seal)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                      {seal.activo ? <ShieldOff className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                      {seal.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
