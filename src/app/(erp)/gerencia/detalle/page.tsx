"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import type { IndicadorGerencia, DetalleIndicador } from "@/lib/gerencia-types";

const INDICADOR_OPTIONS: { value: IndicadorGerencia; label: string }[] = [
  { value: "cotizaciones_creadas", label: "Cotizaciones creadas" },
  { value: "cotizaciones_emitidas", label: "Cotizaciones emitidas" },
  { value: "ordenes_creadas", label: "Órdenes creadas" },
  { value: "ciclos_realizados", label: "Ciclos realizados" },
  { value: "ciclos_aprobados", label: "Ciclos aprobados" },
  { value: "ciclos_rechazados", label: "Ciclos rechazados" },
  { value: "certificados_emitidos", label: "Certificados emitidos" },
  { value: "entregas", label: "Entregas" },
  { value: "cotizaciones_borrador", label: "Cotizaciones borrador" },
  { value: "cotizaciones_por_emitir", label: "Cotizaciones por emitir" },
  { value: "ordenes_abiertas", label: "Órdenes abiertas" },
  { value: "calidad_por_revisar", label: "Calidad por revisar" },
];

export default function DetalleGerenciaPage() {
  const { can, current_scope } = useSession();
  const canView = can("gerencia.metricas.ver");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [indicador, setIndicador] = useState<IndicadorGerencia | null>(null);
  const [detalle, setDetalle] = useState<DetalleIndicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const INDICADOR_LABELS: Record<IndicadorGerencia, string> = {
    cotizaciones_creadas: "Cotizaciones creadas",
    cotizaciones_emitidas: "Cotizaciones emitidas",
    ordenes_creadas: "Órdenes creadas",
    ciclos_realizados: "Ciclos realizados",
    ciclos_aprobados: "Ciclos aprobados",
    ciclos_rechazados: "Ciclos rechazados",
    certificados_emitidos: "Certificados emitidos",
    entregas: "Entregas",
    cotizaciones_borrador: "Cotizaciones borrador",
    cotizaciones_por_emitir: "Cotizaciones por emitir",
    ordenes_abiertas: "Órdenes abiertas",
    calidad_por_revisar: "Calidad por revisar",
  };

  const loadDetalle = useCallback(async () => {
    if (!indicador) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("indicador", indicador);
      if (current_scope?.kind !== "GLOBAL" && current_scope?.id) {
        params.set("scope_id", String(current_scope.id));
      }
      const desde = searchParams.get("desde");
      const hasta = searchParams.get("hasta");
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
      const { data } = await api.get<DetalleIndicador[]>("/gerencia/detalle", {
        params,
      });
      setDetalle(data);
    } catch {
      setError("No se pudo cargar el detalle del indicador.");
    } finally {
      setLoading(false);
    }
  }, [indicador, current_scope, searchParams]);

  useEffect(() => {
    const param = searchParams.get("indicador");
    if (param && INDICADOR_OPTIONS.some((o) => o.value === param)) {
      const id = setTimeout(() => setIndicador(param as IndicadorGerencia), 0);
      return () => clearTimeout(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (canView && indicador) {
      const id = setTimeout(() => void loadDetalle(), 0);
      return () => clearTimeout(id);
    }
  }, [canView, indicador, loadDetalle]);

  if (!canView) {
    return null;
  }

  if (!indicador) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <PageHeader title="Detalle de Indicador" description="Selecciona un indicador para ver su detalle." />
        <Card>
          <div className="p-6 text-center">
            <p className="text-surface-subtle text-sm">
              No se especificó un indicador válido. Vuelve al resumen de
              métricas para seleccionar uno.
            </p>
            <Button
              type="button"
              onClick={() => router.replace("/gerencia")}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Métricas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title={`Detalle — ${INDICADOR_LABELS[indicador]}`}
        description={
          <>
            Evolución diaria del indicador{" "}
            {current_scope ? `· Ámbito: ${current_scope.name}` : ""}
          </>
        }
        actions={
          <Link href="/gerencia">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Métricas
            </Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadDetalle()} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <Select
              label="Indicador"
              options={INDICADOR_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={indicador}
              onChange={(e) => {
                const val = e.target.value as IndicadorGerencia;
                setIndicador(val);
                router.replace(
                  `/gerencia/detalle?indicador=${val}&desde=${searchParams.get("desde") ?? ""}&hasta=${searchParams.get("hasta") ?? ""}`,
                );
              }}
              placeholder="Selecciona un indicador"
              className="w-auto min-w-[260px]"
            />
            <Button
              variant="ghost"
              onClick={() => void loadDetalle()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              Actualizar
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Valor</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Etiqueta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? (
                    <TableState colSpan={3} message="Cargando detalle..." loading />
                  ) : detalle.length === 0 ? (
                    <TableState colSpan={3} message="No hay datos disponibles para este indicador." />
                  ) : (
                    detalle.map((item) => (
                      <tr key={`${item.fecha}-${item.indicador}`} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 text-surface-subtle text-sm">
                          {formatDateTime(item.fecha)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold">
                          {item.valor}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral">{item.etiqueta}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
