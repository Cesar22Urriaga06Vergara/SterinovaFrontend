"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import type { ProtocoloVersion } from "@/lib/operational-types";

type ProtocoloConMeta = ProtocoloVersion & {
  creado_por?: { nombre: string } | null;
  created_at?: string;
};

export default function ProtocolosPage() {
  const { can } = useSession();
  const canView = can("planta.protocolos.ver");
  const [protocolos, setProtocolos] = useState<ProtocoloConMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<ProtocoloConMeta[]>("/planta/protocolos");
      setProtocolos(data);
    } catch {
      setError("No se pudieron cargar los protocolos de calidad.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) {
      const id = setTimeout(() => void loadData(), 0);
      return () => clearTimeout(id);
    }
  }, [canView, loadData]);

  if (!canView) {
    return null;
  }

  const metodoLabel = (metodo: string) =>
    metodo === "ETO" ? "EtO" : "Vapor";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Protocolos de Calidad"
        description="Versiones de protocolos de esterilización aplicables a los procesos de Planta."
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border text-left text-sm">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Método</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Versión</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Creado por</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Especificaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 bg-surface">
                {loading ? (
                  <TableState colSpan={5} message="Cargando protocolos..." loading />
                ) : protocolos.length === 0 ? (
                  <TableState colSpan={5} message="No hay protocolos de calidad registrados." />
                ) : (
                  protocolos.map((protocolo) => (
                    <tr key={protocolo.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Badge variant="info">{metodoLabel(protocolo.metodo)}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        v{protocolo.version}
                      </td>
                      <td className="px-4 py-3">
                        {protocolo.creado_por?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-surface-subtle text-sm">
                        {formatDateTime(protocolo.created_at ?? "")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/configuracion/plantillas/versiones/protocolo/${protocolo.id}`}
                          className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                        >
                          Ver detalles <ArrowRight className="h-3 w-3" aria-hidden />
                        </Link>
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
