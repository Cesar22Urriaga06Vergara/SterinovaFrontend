"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ESTADO_COLORES, ESTADO_LABELS, OrdenServicio } from "@/lib/logistica-types";
import { CicloEsterilizacion } from "@/lib/planta-types";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";

export default function PlantaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useSession();
  const canCreateCycle = can("planta.ciclos.crear");
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [ciclos, setCiclos] = useState<CicloEsterilizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<OrdenServicio[]>("/planta/ordenes"),
      api.get<CicloEsterilizacion[]>("/planta/ciclos"),
    ])
      .then(([ordenesResponse, ciclosResponse]) => {
        if (active) {
          setOrdenes(ordenesResponse.data);
          setCiclos(ciclosResponse.data);
        }
      })
      .catch(() => {
        if (active) {
          setError("No se pudieron cargar las órdenes y ciclos de planta.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-sterinova-dark">Planta</h1>
        <p className="mt-1 text-sterinova-teal">
          Órdenes listas para proceso e historial de ciclos de esterilización.
        </p>
      </header>

      {searchParams.get("ciclo") === "registrado" ? (
        <p className="text-sm font-medium text-green-700" role="status">
          Ciclo registrado correctamente.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-sterinova-dark">
          Órdenes en Planta
        </h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
          <table className="min-w-full divide-y divide-sterinova-dark/10 text-left text-sm">
            <thead className="bg-sterinova-light text-sterinova-dark">
              <tr>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Fecha programada</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sterinova-dark/5">
              {loading ? (
                <TableState colSpan={5} message="Cargando órdenes de planta..." loading />
              ) : ordenes.length === 0 ? (
                <TableState colSpan={5} message="No hay órdenes listas para procesar." />
              ) : (
                ordenes.map((orden) => (
                  <tr key={orden.id} className="text-sterinova-dark">
                    <td className="px-4 py-3 font-medium">{orden.consecutivo}</td>
                    <td className="px-4 py-3">
                      {orden.cotizacion?.cliente?.razon_social ?? "—"}
                    </td>
                    <td className="px-4 py-3">{orden.fecha_programada}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ESTADO_COLORES[orden.estado]}`}>
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
                          className="rounded-lg bg-sterinova-orange px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
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
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-sterinova-dark">
          Historial de Ciclos
        </h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
          <table className="min-w-full divide-y divide-sterinova-dark/10 text-left text-sm">
            <thead className="bg-sterinova-light text-sterinova-dark">
              <tr>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3 font-semibold">Fecha de proceso</th>
                <th className="px-4 py-3 font-semibold">Operador</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sterinova-dark/5">
              {loading ? (
                <TableState colSpan={6} message="Cargando historial de ciclos..." loading />
              ) : ciclos.length === 0 ? (
                <TableState colSpan={6} message="Aún no hay ciclos registrados." />
              ) : (
                ciclos.map((ciclo) => (
                  <tr key={ciclo.id} className="text-sterinova-dark">
                    <td className="px-4 py-3 font-medium">
                      {ciclo.orden?.consecutivo ?? `#${ciclo.orden_id}`}
                    </td>
                    <td className="px-4 py-3">{ciclo.equipo}</td>
                    <td className="px-4 py-3">{ciclo.metodo === "ETO" ? "EtO" : "Vapor"}</td>
                    <td className="px-4 py-3">
                      {new Date(ciclo.fecha_proceso).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{ciclo.operador?.nombre ?? "—"}</td>
                    <td className="px-4 py-3">{ciclo.estado.replaceAll("_", " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
