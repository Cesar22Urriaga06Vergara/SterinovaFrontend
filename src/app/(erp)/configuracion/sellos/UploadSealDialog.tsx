import type { FormEvent } from "react";
import { ImagePlus } from "lucide-react";

export function UploadSealDialog({
  name,
  license,
  file,
  saving,
  error,
  onNameChange,
  onLicenseChange,
  onFileChange,
  onSubmit,
  onClose,
}: {
  name: string;
  license: string;
  file: File | null;
  saving: boolean;
  error: string;
  onNameChange: (value: string) => void;
  onLicenseChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <section className="w-full max-w-lg rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="seal-form-title">
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <h2 id="seal-form-title" className="text-xl font-bold text-sterinova-dark">Subir sello</h2>
            <p className="mt-1 text-sm text-slate-500">Carga una imagen PNG o JPG de hasta 5 MB.</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">Nombre de la norma</span>
            <input required maxLength={120} value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="ISO 9001" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/20" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">Número de licencia</span>
            <input required maxLength={150} value={license} onChange={(event) => onLicenseChange(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/20" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">Archivo del sello</span>
            <input required type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-sterinova-teal" />
          </label>
          {file ? <p className="text-xs text-slate-500">Archivo seleccionado: {file.name}</p> : null}
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-sterinova-dark px-4 py-2 text-sm font-semibold text-white hover:bg-sterinova-teal disabled:opacity-60"><ImagePlus className="h-4 w-4" aria-hidden />{saving ? "Subiendo…" : "Guardar sello"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
