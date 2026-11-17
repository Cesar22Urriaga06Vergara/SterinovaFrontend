"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ESTADO_COLORES, ESTADO_LABELS, OrdenServicio } from "@/lib/logistica-types";
import { CicloEsterilizacion } from "@/lib/planta-types";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";

export default function PlantaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useSession();
  const canViewOrders = can("planta.ordenes.ver");
  const canViewCycles = can("planta.ciclos.ver");
  const canCreateCycle = can("planta.ciclos.crear");
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [ciclos, setCiclos] = useState<CicloEsterilizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      canViewOrders ? api.get<OrdenServicio[]>("/planta/ordenes") : Promise.resolve({ data: [] }),
      canViewCycles ? api.get<CicloEsterilizacion[]>("/planta/ciclos") : Promise.resolve({ data: [] }),
    ])
      .then(([ordenesResponse, ciclosResponse]) => {
        if (active) {
          setOrdenes(ordenesResponse.data);
          setCiclos(ciclosResponse.data);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("No se pudieron cargar las órdenes y ciclos de planta.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canViewOrders, canViewCycles]);

  async function refreshData() {
    setLoading(true);
    setLoadError("");
    try {
      const [ordenesResponse, ciclosResponse] = await Promise.all([
        canViewOrders ? api.get<OrdenServicio[]>("/planta/ordenes") : Promise.resolve({ data: [] }),
        canViewCycles ? api.get<CicloEsterilizacion[]>("/planta/ciclos") : Promise.resolve({ data: [] }),
      ]);
      setOrdenes(ordenesResponse.data);
      setCiclos(ciclosResponse.data);
    } catch {
      setLoadError("No se pudieron cargar las órdenes y ciclos de planta.");
    } finally {
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <PageHeader
          title="Planta"
          description="Órdenes listas para proceso e historial de ciclos de esterilización."
        />
        <ErrorState
          message={loadError}
          onRetry={() => void refreshData()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PageHeader
        title="Planta"
        description="Órdenes listas para proceso e historial de ciclos de esterilización."
      />

      {searchParams.get("ciclo") === "registrado" ? (
        <p
          className="rounded-control bg-success-light px-4 py-3 text-sm font-medium text-success-foreground"
          role="status"
        >
          Ciclo registrado correctamente.
        </p>
      ) : null}

      {canViewOrders ? <section className="space-y-3">
        <h2 className="text-h4 text-surface-foreground">Órdenes en Planta</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border text-left text-body">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Orden</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Fecha programada</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={5} message="Cargando órdenes de planta..." loading />
                ) : ordenes.length === 0 ? (
                  <TableState colSpan={5} message="No hay órdenes listas para procesar." />
                ) : (
                  ordenes.map((orden) => (
                    <tr key={orden.id} className="text-surface-foreground transition-colors hover:bg-background/60">
                      <td className="px-4 py-3 font-medium">{orden.consecutivo}</td>
                      <td className="px-4 py-3">
                        {orden.cotizacion?.cliente?.razon_social ?? "—"}
                      </td>
                      <td className="px-4 py-3">{orden.fecha_programada}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ESTADO_COLORES[orden.estado]}`}>
                          {ESTADO_LABELS[orden.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canCreateCycle ? (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/planta/ciclo/nuevo?orden_id=${orden.id}`)
                            }
                            className="rounded-control bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          >
                            Registrar Ciclo
                          </button>
                        ) : (
                          <span className="text-sm text-surface-subtle">Solo consulta</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section> : null}

      {canViewCycles ? <section className="space-y-3">
        <h2 className="text-h4 text-surface-foreground">Historial de Ciclos</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border text-left text-body">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Orden</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Equipo</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Método</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Fecha de proceso</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Operador</th>
                  <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={6} message="Cargando historial de ciclos..." loading />
                ) : ciclos.length === 0 ? (
                  <TableState colSpan={6} message="Aún no hay ciclos registrados." />
                ) : (
                  ciclos.map((ciclo) => (
                    <tr key={ciclo.id} className="text-surface-foreground transition-colors hover:bg-background/60">
                      <td className="px-4 py-3 font-medium">
                        {ciclo.orden?.consecutivo ?? `#${ciclo.orden_id}`}
                      </td>
                      <td className="px-4 py-3">{ciclo.equipo}</td>
                      <td className="px-4 py-3">{ciclo.metodo === "ETO" ? "EtO" : "Vapor"}</td>
                      <td className="px-4 py-3">
                        {formatDateTime(ciclo.fecha_proceso)}
                      </td>
                      <td className="px-4 py-3">{ciclo.operador?.nombre ?? "—"}</td>
                      <td className="px-4 py-3">{ciclo.estado.replaceAll("_", " ")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section> : null}
    </div>
  );
}
