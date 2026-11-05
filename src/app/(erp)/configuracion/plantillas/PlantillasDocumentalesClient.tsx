"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

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
    paragraphs?: string[];
    commercial_terms?: string[];
    signatures?: TemplateSignature[];
    [key: string]: unknown;
  };
};

type DocumentTemplate = {
  id: number;
  clave: string;
  tipo_documento: string;
  tipo_servicio: string | null;
  codigo: string;
  nombre: string;
  versiones: TemplateVersion[];
};

type EditorState = {
  clave: string;
  tipo_servicio: string;
  codigo: string;
  nombre: string;
  version: string;
  fecha_version: string;
  responsable: string;
  introduccion: string;
  condiciones_comerciales: string;
  firmas: string;
};

const serviceOptions = [
  ["INDUSTRIAL_ETO", "Esterilización Industrial"],
  ["INSTITUCIONAL_ETO", "Esterilización Institucional EtO"],
  ["INSTITUCIONAL_VAPOR", "Esterilización Institucional Vapor"],
  ["INSUMOS", "Insumos"],
  ["LAVANDERIA", "Lavandería Farmacéutica"],
];

const today = new Date().toISOString().slice(0, 10);
const emptyEditor = (): EditorState => ({
  clave: "COTIZACION_LAVANDERIA",
  tipo_servicio: "LAVANDERIA",
  codigo: "R-CM-07-5",
  nombre: "",
  version: "1",
  fecha_version: today,
  responsable: "",
  introduccion: "",
  condiciones_comerciales: "",
  firmas: "",
});

function versionDate(version: TemplateVersion): string {
  return version.fecha_version?.slice(0, 10) ?? today;
}

function toEditor(
  format: DocumentTemplate,
  version: TemplateVersion,
): EditorState {
  const config = version.configuracion_json;
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
    clave: format.clave,
    tipo_servicio: format.tipo_servicio ?? "LAVANDERIA",
    codigo: format.codigo,
    nombre: format.nombre,
    version: String(version.version),
    fecha_version: versionDate(version),
    responsable: version.responsable,
    introduccion: config.paragraphs?.join("\n") ?? "",
    condiciones_comerciales: config.commercial_terms?.join("\n") ?? "",
    firmas: signatures,
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
        .filter((template) => template.tipo_documento === "COTIZACION")
        .sort((a, b) => a.codigo.localeCompare(b.codigo)),
    [templates],
  );

  function startCreate() {
    setEditing(null);
    setFormOpen(true);
    setEditor(emptyEditor());
    setError("");
  }

  function startEdit(format: DocumentTemplate, version: TemplateVersion) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      codigo: editor.codigo.trim(),
      nombre: editor.nombre.trim(),
      fecha_version: editor.fecha_version,
      responsable: editor.responsable.trim(),
      introduccion: editor.introduccion,
      condiciones_comerciales: editor.condiciones_comerciales,
      firmas: signaturePayload(editor.firmas),
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
          tipo_documento: "COTIZACION",
          tipo_servicio: editor.tipo_servicio,
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
          <h1 className="text-3xl font-bold text-sterinova-dark">
            Plantillas documentales
          </h1>
          <p className="mt-1 text-sterinova-teal">
            Administre versiones, textos y publicación de formatos.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva plantilla
        </button>
      </header>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <section className="space-y-4">
        {loading ? (
          <p className="text-sterinova-teal">Cargando plantillas...</p>
        ) : orderedTemplates.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sterinova-teal">
            No hay plantillas documentales registradas.
          </p>
        ) : (
          orderedTemplates.map((format) => (
            <article
              key={format.id}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sterinova-teal">
                    {format.codigo} · {format.clave}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-sterinova-dark">
                    {format.nombre}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void addVersion(format)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-sterinova-dark"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Nueva versión
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTemplate(format)}
                    aria-label={`Eliminar ${format.codigo}`}
                    className="rounded-lg border px-3 py-2 text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="mt-4 divide-y divide-sterinova-dark/10">
                {[...format.versiones]
                  .sort((a, b) => b.version - a.version)
                  .map((version) => (
                    <div
                      key={version.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <strong className="text-sterinova-dark">
                          Versión {String(version.version).padStart(2, "0")}
                        </strong>
                        <span className="rounded-full bg-sterinova-light px-2.5 py-1 text-xs font-semibold text-sterinova-dark">
                          {stateLabel(version.estado)}
                          {version.es_vigente ? " · Vigente" : ""}
                        </span>
                        <span className="text-sterinova-teal">
                          Responsable: {version.responsable}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {version.estado === "BORRADOR" ? (
                          <button
                            type="button"
                            onClick={() => startEdit(format, version)}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            Editar
                          </button>
                        ) : null}
                        {availableTransitions(version.estado).map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={() =>
                              void changeState(format.id, version, next)
                            }
                            className="rounded-lg bg-sterinova-teal px-3 py-1.5 text-sm font-medium text-white"
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
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
          <h2 className="text-xl font-bold text-sterinova-dark">
            {editing ? "Editar versión borrador" : "Crear plantilla"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            {!editing ? (
              <>
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
                className="rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
