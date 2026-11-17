"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { TableState } from "@/components/ui/states/TableState";
import { useSession } from "@/lib/session";
import type { TasaFiscalVersion, PublicarTasaDto } from "@/lib/tasas-fiscales-types";

export default function TasasFiscalesPage() {
  const { can } = useSession();
  const canManage = can("tasas_fiscales.gestionar");
  const [tasas, setTasas] = useState<TasaFiscalVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [tasa, setTasa] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [motivo, setMotivo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<TasaFiscalVersion[]>("/tasas-fiscales/iva");
      setTasas(data);
    } catch {
      setError("No se pudieron cargar las tasas fiscales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => void loadData(), 0);
    return () => clearTimeout(id);
  }, [loadData]);

  async function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!tasa || !vigenteDesde || !motivo) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const dto: PublicarTasaDto = { tasa, vigente_desde: vigenteDesde, motivo };
      await api.post<TasaFiscalVersion>("/tasas-fiscales/iva", dto);
      setFormOpen(false);
      setTasa("");
      setVigenteDesde("");
      setMotivo("");
      await loadData();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo publicar la tasa.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  const tasaLabel = (t: string) => {
    const num = Number(t);
    return Number.isFinite(num) ? `${(num * 100).toFixed(4)}%` : t;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Tasas Fiscales / IVA"
        description="Historial y publicación de versiones de la tasa de IVA. Solo SuperAdmin puede publicar nuevas versiones."
        actions={
          canManage ? (
            <Button
              type="button"
              onClick={() => {
                setFormOpen(true);
                setFormError("");
              }}
            >
              <Plus className="h-4 w-4" aria-hidden /> Publicar Tasa
            </Button>
          ) : null
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : (
        <div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-border text-left text-sm">
                <thead className="bg-background text-surface-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Versión</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Tasa</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Vigente desde</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Motivo</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Creado por</th>
                    <th className="px-4 py-3 font-semibold text-surface-subtle text-xs uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 bg-surface">
                  {loading ? (
                    <TableState colSpan={6} message="Cargando tasas fiscales..." loading />
                  ) : tasas.length === 0 ? (
                    <TableState colSpan={6} message="No hay tasas fiscales registradas." />
                  ) : (
                    tasas.map((t) => (
                      <tr key={t.id} className="text-surface-foreground hover:bg-background/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm">v{t.version}</td>
                        <td className="px-4 py-3 font-medium">{tasaLabel(t.tasa)}</td>
                        <td className="px-4 py-3 text-surface-subtle text-sm">
                          {formatDateTime(t.vigente_desde)}
                        </td>
                        <td className="px-4 py-3">{t.motivo ?? "—"}</td>
                        <td className="px-4 py-3">{t.creado_por != null ? `Usuario #${t.creado_por}` : "—"}</td>
                        <td className="px-4 py-3 text-surface-subtle text-sm">
                          {formatDateTime(t.creado_at ?? t.vigente_desde)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {formOpen && canManage ? (
            <Card>
              <form onSubmit={handlePublish} className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    label="Tasa (decimal, ej. 0.190000)"
                    value={tasa}
                    onChange={(e) => setTasa(e.target.value)}
                    placeholder="0.190000"
                    error={formError && "tasa" ? "Valor inválido" : undefined}
                  />
                  <Input
                    label="Vigente desde (fecha)"
                    type="date"
                    value={vigenteDesde}
                    onChange={(e) => setVigenteDesde(e.target.value)}
                    error={formError && "vigente" ? "Fecha inválida" : undefined}
                  />
                  <Input
                    label="Motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo de la nueva versión"
                    error={formError && "motivo" ? "Motivo requerido" : undefined}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                  >
                    {saving ? "Publicando..." : "Publicar Tasa"}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                {formError && (
                  <p role="alert" className="text-sm text-error">
                    {formError}
                  </p>
                )}
              </form>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
