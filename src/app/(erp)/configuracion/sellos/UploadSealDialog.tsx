import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function UploadSealDialog({
  name,
  license,
  appliesTo,
  editing,
  currentImageUrl,
  file,
  saving,
  error,
  onNameChange,
  onLicenseChange,
  onAppliesToChange,
  onFileChange,
  onSubmit,
  onClose,
}: {
  name: string;
  license: string;
  appliesTo: string[];
  editing: boolean;
  currentImageUrl?: string;
  file: File | null;
  saving: boolean;
  error: string;
  onNameChange: (value: string) => void;
  onLicenseChange: (value: string) => void;
  onAppliesToChange: (value: string[]) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const documentTypes = [
    ["COTIZACION:INDUSTRIAL_ETO", "Industrial EtO"],
    ["COTIZACION:INSTITUCIONAL_ETO", "Institucional EtO"],
    ["COTIZACION:INSTITUCIONAL_VAPOR", "Institucional Vapor"],
    ["COTIZACION:INSUMOS", "Insumos"],
    ["COTIZACION:LAVANDERIA", "Lavandería farmacéutica"],
    ["COTIZACION:FARMACEUTICO", "Farmacéutico"],
    ["COTIZACION:FABRICANTE", "Fabricante"],
    ["CERTIFICADO", "Certificados"],
    ["ORDEN_SERVICIO", "Órdenes de servicio"],
    ["ACTA_SERVICIO", "Actas de servicio"],
  ];
  return (
    <Modal
      open
      title={editing ? "Editar sello" : "Subir sello"}
      description="Carga una imagen PNG, JPG o WEBP de hasta 5 MB y selecciona dónde debe aparecer."
      onClose={() => {
        if (!saving) onClose();
      }}
      closeOnBackdrop={false}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-surface-foreground">
          <span className="mb-1.5 block">Nombre de la norma</span>
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="ISO 9001"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </label>
        <label className="block text-sm font-medium text-surface-foreground">
          <span className="mb-1.5 block">Número de licencia</span>
          <input
            required
            maxLength={150}
            value={license}
            onChange={(event) => onLicenseChange(event.target.value)}
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </label>
        <label className="block text-sm font-medium text-surface-foreground">
          <span className="mb-1.5 block">Archivo del sello</span>
          <input
            required={!editing}
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-surface-border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary-light file:px-3 file:py-2 file:font-semibold file:text-secondary"
          />
        </label>
        {preview || currentImageUrl ? <img src={preview || currentImageUrl} alt="Vista previa del sello" className="max-h-32 max-w-56 rounded border bg-white p-2 object-contain" /> : null}
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-surface-foreground">Aplicar este sello a</legend>
          <div className="grid gap-2 sm:grid-cols-2">{documentTypes.map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={appliesTo.includes(value)} onChange={(event) => onAppliesToChange(event.target.checked ? [...appliesTo, value] : appliesTo.filter((item) => item !== value))} /><span>{label}</span></label>)}</div>
        </fieldset>
        {file ? (
          <p className="text-xs text-surface-subtle">
            Archivo seleccionado: {file.name}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-error-foreground">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-surface-foreground disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary-hover disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Guardar sello"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
