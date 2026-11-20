"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";

type VersionStatus =
  | "BORRADOR"
  | "EN_REVISION"
  | "APROBADA"
  | "PUBLICADA"
  | "OBSOLETA";

type TemplateSignature = {
  label: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
};

type TemplateVersion = {
  id: number;
  version: number;
  estado: VersionStatus;
  fecha_version: string | null;
  responsable: string;
  es_vigente: boolean;
  configuracion_json: {
    document_code?: string;
    title?: string;
    version_label?: string;
    paragraphs?: string[];
    commercial_terms?: string[];
    signatures?: TemplateSignature[];
    subtitle?: string;
    footer_notes?: string;
    detail?: { title?: string; columns?: string[]; pricing_note?: string };
    [key: string]: unknown;
  };
};

type DocumentType =
  | "COTIZACION"
  | "CERTIFICADO"
  | "ORDEN_SERVICIO"
  | "ACTA_SERVICIO";

type DocumentTemplate = {
  id: number;
  clave: string;
  tipo_documento: DocumentType;
  tipo_servicio: string | null;
  codigo: string;
  nombre: string;
  cliente_id: number | null;
  versiones: TemplateVersion[];
};

type EditorState = {
  tipo_documento: DocumentType;
  clave: string;
  tipo_servicio: string;
  codigo: string;
  nombre: string;
  version: string;
  version_label: string;
  fecha_version: string;
  responsable: string;
  introduccion: string;
  condiciones_comerciales: string;
  firmas: string;
  subtitulo: string;
  columnas: string;
  titulo_detalle: string;
  nota_precios: string;
  pie_notas: string;
  cliente_id: string;
};

type CustomerOption = { id: number; razon_social: string };

const serviceOptions = [
  ["INDUSTRIAL_ETO", "Esterilización Industrial"],
  ["INSTITUCIONAL_ETO", "Esterilización Institucional EtO"],
  ["INSTITUCIONAL_VAPOR", "Esterilización Institucional Vapor"],
  ["INSUMOS", "Insumos"],
  ["LAVANDERIA", "Lavandería Farmacéutica"],
  ["FARMACEUTICO", "Farmacéutico"],
  ["FABRICANTE", "Fabricante"],
];

const today = new Date().toISOString().slice(0, 10);
const emptyEditor = (): EditorState => ({
  tipo_documento: "COTIZACION",
  clave: "COTIZACION_LAVANDERIA",
  tipo_servicio: "LAVANDERIA",
  codigo: "R-CM-07-5",
  nombre: "",
  version: "1",
  version_label: "01",
  fecha_version: today,
  responsable: "",
  introduccion: "",
  condiciones_comerciales: "",
  firmas: "",
  subtitulo: "",
  columnas: "DESCRIPCIÓN\nCANTIDAD\nVALOR UNITARIO\nVALOR TOTAL",
  titulo_detalle: "DETALLE DE COTIZACIÓN:",
  nota_precios: "Precios antes de IVA (19%).",
  pie_notas: "",
  cliente_id: "",
});

const documentTypeOptions: Array<[DocumentType, string]> = [
  ["COTIZACION", "Cotización"],
  ["CERTIFICADO", "Certificado de esterilización"],
  ["ORDEN_SERVICIO", "Orden de servicio"],
  ["ACTA_SERVICIO", "Acta de servicio"],
];

const typeDefaults: Record<
  DocumentType,
  { clave: string; codigo: string; nombre: string }
> = {
  COTIZACION: {
    clave: "COTIZACION_LAVANDERIA",
    codigo: "R-CM-07-5",
    nombre: "LAVANDERÍA DOTACIÓN FARMACÉUTICA",
  },
  CERTIFICADO: {
    clave: "CERTIFICADO_ESTERILIZACION",
    codigo: "R-AQ-09",
    nombre: "CERTIFICADO DE ESTERILIZACIÓN",
  },
  ORDEN_SERVICIO: {
    clave: "ORDEN_SERVICIO",
    codigo: "R-ES-02",
    nombre: "ORDEN DE SERVICIO DE ESTERILIZACIÓN",
  },
  ACTA_SERVICIO: {
    clave: "ACTA_SERVICIO",
    codigo: "R-LG-04",
    nombre: "ACTA DE SERVICIO",
  },
};

function versionDate(version: TemplateVersion): string {
  return version.fecha_version?.slice(0, 10) ?? today;
}

function toEditor(
  format: DocumentTemplate,
  version: TemplateVersion,
): EditorState {
  const config = version.configuracion_json;
  const detail = config.detail ?? {};
  const signatures = Array.isArray(config.signatures)
    ? config.signatures
        .map((signature) =>
          [
            signature.label,
            signature.name,
            signature.role,
            signature.phone ?? "",
            signature.email ?? "",
          ].join(" | "),
        )
        .join("\n")
    : "";
  return {
    tipo_documento: format.tipo_documento,
    clave: format.clave,
    tipo_servicio: format.tipo_servicio ?? "LAVANDERIA",
    codigo: String(config.document_code ?? format.codigo),
    nombre: String(config.title ?? format.nombre),
    version: String(version.version),
    version_label: String(config.version_label ?? String(version.version).padStart(2, "0")),
    fecha_version: versionDate(version),
    responsable: version.responsable,
    introduccion: config.paragraphs?.join("\n") ?? "",
    condiciones_comerciales: config.commercial_terms?.join("\n") ?? "",
    firmas: signatures,
    subtitulo: String(config.subtitle ?? ""),
    columnas: Array.isArray(detail.columns) ? detail.columns.join("\n") : "DESCRIPCIÓN\nCANTIDAD\nVALOR UNITARIO\nVALOR TOTAL",
    titulo_detalle: String(detail.title ?? "DETALLE DE COTIZACIÓN:"),
    nota_precios: String(detail.pricing_note ?? ""),
    pie_notas: String(config.footer_notes ?? ""),
    cliente_id: String(format.cliente_id ?? ""),
  };
}

function signaturePayload(value: string): TemplateSignature[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, name, role]) => Boolean(label && name && role))
    .map(([label, name, role, phone, email]) => ({
      label,
      name,
      role,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
    }));
}

function availableTransitions(state: VersionStatus): VersionStatus[] {
  const transitions: Record<VersionStatus, VersionStatus[]> = {
    BORRADOR: ["EN_REVISION"],
    EN_REVISION: ["BORRADOR", "APROBADA"],
    APROBADA: ["EN_REVISION", "PUBLICADA"],
    PUBLICADA: ["OBSOLETA"],
    OBSOLETA: [],
  };
  return transitions[state];
}

function stateLabel(state: VersionStatus): string {
  return {
    BORRADOR: "Borrador",
    EN_REVISION: "En revisión",
    APROBADA: "Aprobada",
    PUBLICADA: "Publicada",
    OBSOLETA: "Obsoleta",
  }[state];
}

export default function PlantillasDocumentalesClient() {
  const { can } = useSession();
  const canCreateTemplate = can("formatos.crear");
  const canCreateVersion = can("formatos.versiones.crear");
  const canEditVersion = can("formatos.versiones.editar");
  const canPublishVersion = can("formatos.versiones.publicar");
  const canDeleteTemplate = can("formatos.eliminar");
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{
    formatId: number;
    versionId: number;
  } | null>(null);
  const [cloneMode, setCloneMode] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const loadTemplates = useCallback(async () => {
    const { data } = await api.get<DocumentTemplate[]>("/formatos-documentales");
    setTemplates(data);
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get<DocumentTemplate[]>("/formatos-documentales")
      .then(({ data }) => {
        if (active) setTemplates(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar las plantillas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const orderedTemplates = useMemo(
    () =>
      templates
        .sort((a, b) => a.codigo.localeCompare(b.codigo)),
    [templates],
  );

  function startCreate() {
    setEditing(null);
    setCloneMode(false);
    setFormOpen(true);
    setEditor(emptyEditor());
    setError("");
  }

  async function startClone(format: DocumentTemplate, version: TemplateVersion) {
    setEditing(null);
    setCloneMode(true);
    setFormOpen(true);
    setEditor({ ...toEditor(format, version), clave: `${format.clave}_CLIENTE`, cliente_id: "" });
    setError("");
    try {
      const { data } = await api.get<CustomerOption[]>("/clientes");
      setCustomers(data.filter((customer) => Number.isInteger(customer.id) && customer.razon_social));
    } catch {
      setError("No se pudieron cargar clientes para asignar el formato.");
    }
  }

  function startEdit(format: DocumentTemplate, version: TemplateVersion) {
    setCloneMode(false);
    setEditing({ formatId: format.id, versionId: version.id });
    setFormOpen(true);
    setEditor(toEditor(format, version));
    setError("");
  }

  function updateEditor<K extends keyof EditorState>(
    key: K,
    value: EditorState[K],
  ) {
    setEditor((current) => ({ ...current, [key]: value }));
  }

  function selectDocumentType(tipo_documento: DocumentType) {
    const defaults = typeDefaults[tipo_documento];
    setEditor((current) => ({
      ...current,
      tipo_documento,
      tipo_servicio:
        tipo_documento === "COTIZACION"
          ? current.tipo_servicio || "LAVANDERIA"
          : "",
      ...defaults,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      codigo: editor.codigo.trim(),
      nombre: editor.nombre.trim(),
      version_label: editor.version_label.trim(),
      fecha_version: editor.fecha_version,
      responsable: editor.responsable.trim(),
      introduccion: editor.introduccion,
      condiciones_comerciales: editor.condiciones_comerciales,
      firmas: signaturePayload(editor.firmas),
      subtitulo: editor.subtitulo.trim(),
      columnas: editor.columnas.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      titulo_detalle: editor.titulo_detalle.trim(),
      nota_precios: editor.nota_precios.trim(),
      pie_notas: editor.pie_notas,
    };

    try {
      if (editing) {
        await api.put(
          `/formatos-documentales/${editing.formatId}/versiones/${editing.versionId}`,
          payload,
        );
      } else {
        await api.post("/formatos-documentales", {
          ...payload,
          clave: editor.clave,
          ...(editor.cliente_id ? { cliente_id: Number(editor.cliente_id) } : {}),
          tipo_documento: editor.tipo_documento,
          tipo_servicio:
            editor.tipo_documento === "COTIZACION"
              ? editor.tipo_servicio
              : null,
          version: Number(editor.version),
        });
      }
      await loadTemplates();
      setEditing(null);
      setFormOpen(false);
      setEditor(emptyEditor());
    } catch {
      setError("No se pudo guardar la plantilla. Verifique sus datos y estado.");
    } finally {
      setSaving(false);
    }
  }

  async function addVersion(format: DocumentTemplate) {
    const latest = [...format.versiones].sort((a, b) => b.version - a.version)[0];
    try {
      const { data } = await api.post<TemplateVersion>(
        `/formatos-documentales/${format.id}/versiones`,
        {
          fecha_version: today,
          responsable: latest?.responsable ?? "",
        },
      );
      await loadTemplates();
      setEditing({ formatId: format.id, versionId: data.id });
      setFormOpen(true);
      setEditor(toEditor(format, data));
    } catch {
      setError("No se pudo crear una nueva versión.");
    }
  }

  async function changeState(
    formatId: number,
    version: TemplateVersion,
    estado: VersionStatus,
  ) {
    setError("");
    try {
      await api.post(
        `/formatos-documentales/${formatId}/versiones/${version.id}/estado`,
        { estado },
      );
      await loadTemplates();
    } catch {
      setError(`No se pudo cambiar la versión a ${stateLabel(estado)}.`);
    }
  }

  async function deleteTemplate(format: DocumentTemplate) {
    if (!window.confirm(`¿Eliminar la plantilla ${format.codigo}?`)) return;
    setError("");
    try {
      await api.delete(`/formatos-documentales/${format.id}`);
      await loadTemplates();
    } catch {
      setError("No se puede eliminar una plantilla vinculada a documentos o clientes.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-foreground">
            Plantillas documentales
          </h1>
          <p className="mt-1 text-secondary">
            Administre versiones, textos y publicación de formatos.
          </p>
        </div>
        {canCreateTemplate ? (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nueva plantilla
          </button>
        ) : null}
      </header>

      {error ? (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}

      <section className="space-y-4">
        {loading ? (
          <TableState colSpan={1} message="Cargando plantillas..." loading mode="panel" />
        ) : orderedTemplates.length === 0 ? (
          <div className="rounded-xl bg-surface p-6">
            <p className="text-surface-subtle">No hay plantillas documentales registradas.</p>
          </div>
        ) : (
          orderedTemplates.map((format) => (
            <article
              key={format.id}
              className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {format.codigo} · {format.clave}{format.cliente_id ? " · Formato por cliente" : " · Estándar"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-surface-foreground">
                    {format.nombre}
                  </h2>
                </div>
                <div className="flex gap-2">
                  {canCreateVersion ? (
                    <button
                      type="button"
                      onClick={() => void addVersion(format)}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-surface-foreground"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Nueva versión
                    </button>
                  ) : null}
                  {canDeleteTemplate ? (
                    <button
                      type="button"
                      onClick={() => void deleteTemplate(format)}
                      aria-label={`Eliminar ${format.codigo}`}
                      className="rounded-lg border px-3 py-2 text-red-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 divide-y divide-surface-border">
                {[...format.versiones]
                  .sort((a, b) => b.version - a.version)
                  .map((version) => (
                    <div
                      key={version.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <strong className="text-surface-foreground">
                          {String(version.configuracion_json.document_code ?? format.codigo)} · V
                          {String(version.configuracion_json.version_label ?? String(version.version).padStart(2, "0"))}
                        </strong>
                        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-surface-foreground">
                          {stateLabel(version.estado)}
                          {version.es_vigente ? " · Vigente" : ""}
                        </span>
                        <span className="text-secondary">
                          Responsable: {version.responsable}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {canCreateTemplate && format.tipo_documento === "COTIZACION" ? <button type="button" onClick={() => void startClone(format, version)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm">Clonar para cliente</button> : null}
                        {version.estado === "BORRADOR" && canEditVersion ? (
                          <button
                            type="button"
                            onClick={() => startEdit(format, version)}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            Editar
                          </button>
                        ) : null}
                        {canPublishVersion && availableTransitions(version.estado).map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={() =>
                              void changeState(format.id, version, next)
                            }
                            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                          >
                            {next === "PUBLICADA"
                              ? "Publicar"
                              : stateLabel(next)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          ))
        )}
      </section>

      {formOpen ? (
        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <h2 className="text-xl font-bold text-surface-foreground">
            {editing ? "Editar versión borrador" : "Crear plantilla"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            {cloneMode ? <label className="text-sm md:col-span-2"><span className="mb-1 block font-medium">Cliente de este formato</span><select required value={editor.cliente_id} onChange={(event) => { const id = event.target.value; updateEditor("cliente_id", id); updateEditor("clave", id ? `${editor.clave.split("_CLIENTE")[0]}_CLIENTE_${id}` : `${editor.clave.split("_CLIENTE")[0]}_CLIENTE`); }} className="w-full rounded-lg border px-3 py-2"><option value="">Selecciona un cliente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.razon_social}</option>)}</select></label> : null}
            {!editing ? (
              <>
                <label className="text-sm">
                  <span className="mb-1 block font-medium">Tipo de documento</span>
                  <select
                    value={editor.tipo_documento}
                    onChange={(event) => {
                      const selected = documentTypeOptions.find(
                        ([value]) => value === event.target.value,
                      )?.[0];
                      if (selected) selectDocumentType(selected);
                    }}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    {documentTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {editor.tipo_documento === "COTIZACION" ? (
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Servicio</span>
                    <select
                      value={editor.tipo_servicio}
                      onChange={(event) => {
                        const tipo = event.target.value;
                        updateEditor("tipo_servicio", tipo);
                        updateEditor("clave", `COTIZACION_${tipo}`);
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      {serviceOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <label className="text-sm">
                  <span className="mb-1 block font-medium">Clave</span>
                  <input
                    required
                    value={editor.clave}
                    onChange={(event) =>
                      updateEditor("clave", event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>
              </>
            ) : null}
            <label className="text-sm">
              <span className="mb-1 block font-medium">Código documental</span>
              <input
                required
                value={editor.codigo}
                onChange={(event) => updateEditor("codigo", event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Nombre</span>
              <input
                required
                value={editor.nombre}
                onChange={(event) => updateEditor("nombre", event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            {!editing ? (
              <label className="text-sm">
                <span className="mb-1 block font-medium">Versión inicial</span>
                <input
                  required
                  min="1"
                  type="number"
                  value={editor.version}
                  onChange={(event) =>
                    updateEditor("version", event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>
            ) : null}
            <label className="text-sm">
              <span className="mb-1 block font-medium">Etiqueta de versión impresa</span>
              <input
                required
                value={editor.version_label}
                onChange={(event) =>
                  updateEditor("version_label", event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
                placeholder="04 o 04.1"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Fecha de versión</span>
              <input
                required
                type="date"
                value={editor.fecha_version}
                onChange={(event) =>
                  updateEditor("fecha_version", event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Responsable</span>
              <input
                required
                value={editor.responsable}
                onChange={(event) =>
                  updateEditor("responsable", event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Subtítulo</span>
              <input value={editor.subtitulo} onChange={(event) => updateEditor("subtitulo", event.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Introducción</span>
              <textarea
                rows={4}
                value={editor.introduccion}
                onChange={(event) =>
                  updateEditor("introduccion", event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Columnas visibles (cuatro, una por línea)</span>
              <textarea required rows={4} value={editor.columnas} onChange={(event) => updateEditor("columnas", event.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Título del detalle</span>
              <input value={editor.titulo_detalle} onChange={(event) => updateEditor("titulo_detalle", event.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Nota de precios / IVA</span>
              <input value={editor.nota_precios} onChange={(event) => updateEditor("nota_precios", event.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">
                Condiciones comerciales (una por línea)
              </span>
              <textarea
                rows={4}
                value={editor.condiciones_comerciales}
                onChange={(event) =>
                  updateEditor("condiciones_comerciales", event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Pie y notas del documento</span>
              <textarea rows={3} value={editor.pie_notas} onChange={(event) => updateEditor("pie_notas", event.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">
                Firmas (etiqueta | nombre | cargo | teléfono | correo)
              </span>
              <textarea
                rows={4}
                value={editor.firmas}
                onChange={(event) => updateEditor("firmas", event.target.value)}
                className="w-full rounded-lg border px-3 py-2 font-mono"
              />
            </label>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setCloneMode(false);
                  setFormOpen(false);
                  setEditor(emptyEditor());
                }}
                className="rounded-lg px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar borrador"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
