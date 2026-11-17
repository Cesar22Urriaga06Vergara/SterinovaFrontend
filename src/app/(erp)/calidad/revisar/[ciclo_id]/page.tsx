"use client";

import {
  EvaluacionTecnica,
  type SeleccionesCalidad,
} from "@/components/calidad/EvaluacionTecnica";
import { evaluacionesParaAprobar } from "@/lib/operational-forms";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, LoaderCircle, X } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import { notifyToast } from "@/components/ui/states/toast-events";
import type {
  CicloCalidad,
  CertificadoEsterilizacion,
} from "@/lib/calidad-types";
import { getRejectReasonError } from "@/lib/calidad-validation";
import { formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/session";
import { Modal } from "@/components/ui/Modal";

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

export default function RevisarCicloPage() {
  const { can, user } = useSession();
  const canApprove = can("calidad.aprobar");
  const canReject = can("calidad.rechazar");
  const canDownload = can("certificados.descargar");
  const userId = user?.id;
  const params = useParams<{ ciclo_id: string }>();
  const router = useRouter();
  const cicloId = Number(params.ciclo_id);
  const [selecciones, setSelecciones] = useState<SeleccionesCalidad>({});
  const [ciclo, setCiclo] = useState<CicloCalidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [motivo, setMotivo] = useState("");
  const [issuedCertificate, setIssuedCertificate] =
    useState<CertificadoEsterilizacion | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(cicloId) || cicloId < 1)
      return () => {
        active = false;
      };
    api
      .get<CicloCalidad>(`/calidad/ciclos/${cicloId}`)
      .then(({ data }) => {
        if (active) {
          setCiclo(data);
          setSelecciones({});
          setIssuedCertificate(null);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            errorMessage(cause, "No se pudo cargar el ciclo para revisión."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cicloId]);

  async function handleApprove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ciclo || !canApprove || saving || issuedCertificate) return;
    const evaluaciones = evaluacionesParaAprobar(
      ciclo.protocolo_version ?? undefined,
      selecciones,
    );
    if (!evaluaciones) {
      setError(
        "Completa las evaluaciones y especificaciones conformes antes de aprobar.",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post<CertificadoEsterilizacion>(
        "/calidad/aprobar",
        {
          ciclo_id: ciclo.id,
          evaluaciones,
          password,
        },
      );
      setIssuedCertificate(data);
      notifyToast(
        `Certificado ${data.consecutivo} emitido correctamente.`,
        "success",
      );
      setApprovalOpen(false);
      setPassword("");
      setSaving(false);
    } catch (cause) {
      const message = errorMessage(
        cause,
        "No se pudo aprobar el ciclo. Verifica la contraseña y vuelve a intentarlo.",
      );
      setError(message);
      setSaving(false);
    }
  }

  async function handleDownloadCertificate() {
    if (!issuedCertificate || !canDownload || downloadingCertificate) return;
    setDownloadingCertificate(true);
    setError("");
    try {
      await downloadPdfFromBackend(
        `/certificados/${issuedCertificate.id}/descargar`,
        `CERTIFICADO-${issuedCertificate.consecutivo}.pdf`,
      );
    } catch {
      setError(
        `No se pudo descargar el certificado ${issuedCertificate.consecutivo}.`,
      );
    } finally {
      setDownloadingCertificate(false);
    }
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ciclo || !canReject || saving || issuedCertificate) return;
    const reasonError = getRejectReasonError(motivo);
    if (reasonError) {
      setError(reasonError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/calidad/rechazar", {
        ciclo_id: ciclo.id,
        motivo: motivo.trim(),
        evaluaciones: Object.entries(selecciones)
          .filter(([, s]) => s.criterio && s.opcion !== "")
          .map(([parametro, s]) => ({
            parametro,
            criterio: s.criterio,
            opcion: Number(s.opcion),
          })),
      });
      router.replace("/calidad");
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo rechazar el ciclo."));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href="/calidad"
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Calidad
      </Link>

      {!Number.isInteger(cicloId) || cicloId < 1 ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          El ciclo solicitado no es válido.
        </p>
      ) : loading ? (
        <div className="rounded-xl bg-surface p-12 text-center text-secondary shadow-sm">
          Cargando datos del ciclo...
        </div>
      ) : error && !ciclo ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : ciclo ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Revisión de ciclo #{ciclo.id}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-surface-foreground">
                Orden {ciclo.orden?.consecutivo ?? `#${ciclo.orden_id}`}
              </h1>
              <p className="mt-1 text-slate-600">
                {ciclo.orden?.cotizacion?.cliente?.razon_social ??
                  "Cliente sin nombre"}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-900">
              Pendiente de Calidad
            </span>
          </header>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {issuedCertificate ? (
            <section
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
              role="status"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                  Aprobación completada
                </p>
                <h2 className="mt-1 text-xl font-bold text-emerald-950">
                  Certificado {issuedCertificate.consecutivo} emitido
                  exitosamente
                </h2>
                <p className="mt-1 text-sm text-emerald-800">
                  El PDF oficial quedó guardado en el servidor.
                </p>
              </div>
              {canDownload ? <button
                type="button"
                onClick={() => void handleDownloadCertificate()}
                disabled={downloadingCertificate || !issuedCertificate.pdf_url}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingCertificate ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                {downloadingCertificate
                  ? "Descargando..."
                  : "Descargar Certificado"}
              </button> : null}
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Método", ciclo.metodo === "ETO" ? "EtO" : "Vapor"],
              ["Equipo", ciclo.equipo],
              ["Operador", ciclo.operador?.nombre ?? "—"],
              ["Fecha de proceso", formatDateTime(ciclo.fecha_proceso, {
                dateStyle: "long",
              })],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-surface-border"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 font-semibold text-surface-foreground">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-surface-foreground">
                Parámetros del proceso
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Valores registrados por Planta para su validación.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Control biológico
                </p>
                <p className="mt-1 font-semibold text-surface-foreground">
                  {ciclo.control_biologico || "Sin resultado"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Control químico
                </p>
                <p className="mt-1 font-semibold text-surface-foreground">
                  {ciclo.control_quimico || "Sin resultado"}
                </p>
              </div>
            </div>
            {ciclo.orden?.materiales?.length ? (
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-bold text-surface-foreground">
                  Detalle de materiales relacionado a la orden
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {ciclo.orden.materiales.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span>{item.descripcion}</span>
                      <span className="font-semibold">{item.cantidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <EvaluacionTecnica
            ciclo={ciclo}
            value={selecciones}
            onChange={setSelecciones}
            disabled={saving || !!issuedCertificate || (!canApprove && !canReject)}
          />
          {!issuedCertificate ? (
            <div className="flex flex-wrap justify-end gap-3">
              {canReject && ciclo && userId !== ciclo.operador_id ? <button
                type="button"
                onClick={() => {
                  setError("");
                  setRejectOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-surface px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" aria-hidden /> Rechazar
              </button> : null}
              {canApprove && ciclo && userId !== ciclo.operador_id ? <button
                type="button"
                disabled={
                  userId === ciclo.operador_id ||
                  !evaluacionesParaAprobar(
                    ciclo.protocolo_version ?? undefined,
                    selecciones,
                  )
                }
                onClick={() => {
                  setError("");
                  setApprovalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden /> Aprobar y Emitir
                Certificado
              </button> : null}
            </div>
          ) : null}
        </>
      ) : null}

      {approvalOpen && canApprove ? (
        <Modal
          open
          title="Confirmar firma electrónica"
          onClose={() => {
            if (saving) return;
            setApprovalOpen(false);
            setPassword("");
          }}
        >
          <form
            onSubmit={handleApprove}
            className="space-y-4"
          >
            <div>
              <p className="mt-1 text-sm text-slate-600">
                Vuelve a ingresar la contraseña del Coordinador de Calidad para
                aprobar el ciclo y emitir el certificado.
              </p>
            </div>
            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Contraseña de Calidad
              <input
                required
                maxLength={128}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setApprovalOpen(false);
                  setPassword("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Check className="h-4 w-4" aria-hidden />
                )}
                {saving ? "Validando..." : "Confirmar y emitir"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {rejectOpen && canReject ? (
        <Modal
          open
          title="Rechazar ciclo"
          onClose={() => {
            if (saving) return;
            setRejectOpen(false);
            setMotivo("");
          }}
        >
          <form
            onSubmit={handleReject}
            className="space-y-4"
          >
            <div>
              <p className="mt-1 text-sm text-slate-600">
                El motivo quedará registrado con tu identidad y fecha de
                revisión.
              </p>
            </div>
            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Motivo del rechazo
              <textarea
                required
                minLength={1}
                maxLength={2000}
                rows={4}
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                className="w-full resize-y rounded-lg border border-surface-border px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setRejectOpen(false);
                  setMotivo("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <X className="h-4 w-4" aria-hidden />
                )}
                {saving ? "Guardando..." : "Confirmar rechazo"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
