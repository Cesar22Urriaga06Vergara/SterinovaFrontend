"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import type { EventoAuditoria, AccionAuditoria } from "@/lib/auditoria-types";

const ACCION_LABELS: Record<AccionAuditoria, string> = {
  crear: "Crear",
  editar: "Editar",
  emitir: "Emitir",
  publicar: "Publicar",
  eliminar: "Eliminar",
  anular: "Anular",
  login_exitoso: "Login exitoso",
  login_fallido: "Login fallido",
  aprobar: "Aprobar",
  rechazar: "Rechazar",
  cambiar_estado: "Cambiar estado",
  resetear_password: "Resetear contraseña",
  descargar: "Descargar",
};

const ACCION_VARIANT: Record<AccionAuditoria, "success" | "warning" | "error" | "info" | "neutral"> = {
  crear: "success",
  editar: "info",
  emitir: "success",
  publicar: "info",
  eliminar: "error",
  anular: "error",
  login_exitoso: "success",
  login_fallido: "warning",
  aprobar: "success",
  rechazar: "warning",
  cambiar_estado: "info",
  resetear_password: "warning",
  descargar: "neutral",
};

export default function AuditoriaPage() {
  const { can } = useSession();
  const canView = can("auditoria.ver");
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEntidad, setFiltroEntidad] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filtroEntidad) params.set("entidad", filtroEntidad);
      const { data } = await api.get<EventoAuditoria[]>("/auditoria", { params });
      setEventos(data);
    } catch {
      setError("No se pudieron cargar los eventos de auditoría.");
    } finally {
      setLoading(false);
    }
  }, [filtroEntidad]);

  useEffect(() => {
    if (canView) {
      const id = setTimeout(() => void loadData(), 0);
      return () => clearTimeout(id);
    }
  }, [canView, loadData]);

  if (!canView) {
    return null;
  }

  const filtrados = eventos.filter((e) => {
    if (filtroEntidad && !e.entidad.toLowerCase().includes(filtroEntidad.toLowerCase())) return false;
    if (filtroAccion && e.accion !== filtroAccion) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Eventos de Auditoría"
        description="Registro de acciones realizadas en el sistema. Solo consulta."
        actions={
          <Button
            variant="ghost"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            Actualizar
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="p-4 border-b border-surface-border flex flex-wrap gap-4">
              <Input
                label="Filtrar por entidad"
                value={filtroEntidad}
                onChange={(e) => setFiltroEntidad(e.target.value)}
                placeholder="Ej: cotizaciones, usuarios"
              />
              <Input
                label="Filtrar por acción"
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                placeholder="Ej: crear, aprobar"
              />
            </div>
            <table className="min-w-full divide-y divide-surface-border text-left text-sm">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Usuario</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Entidad</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">ID Registro</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Acción</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={6} message="Cargando eventos de auditoría..." loading />
                ) : filtrados.length === 0 ? (
                  <TableState colSpan={6} message="No se encontraron eventos de auditoría con los filtros aplicados." />
                ) : (
                  filtrados.map((evento) => (
                    <tr key={evento.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                      <td className="px-4 py-3 text-surface-subtle text-sm">
                        {formatDateTime(evento.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {evento.usuario?.nombre ?? `Usuario #${evento.usuario_id ?? "—"}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {evento.entidad}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {evento.entidad_id ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ACCION_VARIANT[evento.accion]}>
                          {ACCION_LABELS[evento.accion]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-surface-subtle text-xs max-w-[300px] truncate">
                        {evento.detalle ? JSON.stringify(evento.detalle).slice(0, 100) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
