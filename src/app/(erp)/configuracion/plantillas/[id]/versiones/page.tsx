"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";

type FormatoVersion = {
  id: number;
  version: number;
  estado: string;
  responsable: string;
  fecha: string;
  aprobador?: { id: number; nombre: string } | null;
  publicado_por?: { id: number; nombre: string } | null;
};

type FormatoDocumental = {
  id: number;
  clave: string;
  nombre: string;
  tipo_documento: string;
};

export default function VersionesFormatoPage() {
  const { can } = useSession();
  const canView = can("formatos.ver");
  const canCreate = can("formatos.versiones.crear");
  const canEditar = can("formatos.versiones.editar");
  const canPublicar = can("formatos.versiones.publicar");
  const params = useParams<{ id: string }>();
  const formatoId = Number(params.id);
  const [formato, setFormato] = useState<FormatoDocumental | null>(null);
  const [versiones, setVersiones] = useState<FormatoVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [versionNumero, setVersionNumero] = useState("");
  const [contenido, setContenido] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [fmtRes, verRes] = await Promise.all([
        api.get<FormatoDocumental>(`/formatos-documentales/${formatoId}`),
        api.get<FormatoVersion[]>(`/formatos-documentales/${formatoId}/versiones`),
      ]);
      setFormato(fmtRes.data);
      setVersiones(verRes.data);
    } catch {
      setError("No se pudieron cargar las versiones del formato.");
    } finally {
      setLoading(false);
    }
  }, [formatoId]);

  useEffect(() => {
    if (canView && Number.isInteger(formatoId)) {
      const id = setTimeout(() => void loadData(), 0);
      return () => clearTimeout(id);
    }
  }, [canView, formatoId, loadData]);

  if (!canView) {
    return null;
  }

  if (!Number.isInteger(formatoId) || formatoId < 1) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        El formato solicitado no es válido.
      </div>
    );
  }

  async function handleCreateVersion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!versionNumero || !contenido) {
      setFormError("Número de versión y contenido son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/formatos-documentales/${formatoId}/versiones`, {
        version: Number(versionNumero),
        contenido,
      });
      setFormOpen(false);
      setVersionNumero("");
      setContenido("");
      await loadData();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo crear la versión.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  const estadoVariant = (estado: string): "success" | "warning" | "info" | "neutral" => {
    switch (estado) {
      case "publicado": return "success";
      case "borrador": return "warning";
      case "retirado": return "neutral";
      default: return "info";
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title={`Versiones — ${formato?.nombre ?? "Formato"}`}
        description={
          <>
            Versiones del formato <code className="font-mono">{formato?.clave}</code> ({formato?.tipo_documento})
          </>
        }
        actions={
          <Link href="/configuracion/plantillas">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Plantillas
            </Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : formato ? (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Versión</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Estado</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Responsable</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Aprobador</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? (
                    <TableState colSpan={6} message="Cargando versiones..." loading />
                  ) : versiones.length === 0 ? (
                    <TableState colSpan={6} message="No hay versiones registradas para este formato." />
                  ) : (
                    versiones.map((v) => (
                      <tr key={v.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm font-semibold">v{v.version}</td>
                        <td className="px-4 py-3">
                          <Badge variant={estadoVariant(v.estado)}>{v.estado}</Badge>
                        </td>
                        <td className="px-4 py-3">{v.responsable}</td>
                        <td className="px-4 py-3">{v.aprobador?.nombre ?? "—"}</td>
                        <td className="px-4 py-3 text-surface-subtle text-sm">
                          {formatDateTime(v.fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            {canEditar && v.estado === "borrador" ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  // Editar versión borrador
                                }}
                              >
                                Editar
                              </Button>
                            ) : null}
                            {canPublicar && v.estado === "borrador" ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  // Publicar versión
                                }}
                              >
                                Publicar
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {formOpen && canCreate ? (
            <Modal
              open={formOpen}
              title="Crear versión de formato"
              onClose={() => setFormOpen(false)}
              size="lg"
            >
              <form onSubmit={handleCreateVersion} className="space-y-4">
                <Input
                  label="Número de versión"
                  type="number"
                  value={versionNumero}
                  onChange={(e) => setVersionNumero(e.target.value)}
                  placeholder="1"
                  error={formError && "version" ? "Requerido" : undefined}
                />
                <Input
                  label="Contenido / descripción"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Descripción de la versión"
                  error={formError && "contenido" ? "Requerido" : undefined}
                />
                {formError && (
                  <p role="alert" className="text-sm text-error">{formError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                  >
                    {saving ? "Guardando..." : "Crear Versión"}
                  </button>
                </div>
              </form>
            </Modal>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
