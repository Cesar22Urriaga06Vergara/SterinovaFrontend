"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, LoaderCircle, X } from "lucide-react";
import { api, downloadPdfFromBackend } from "@/lib/api";
import type { CicloCalidad, CertificadoEsterilizacion } from "@/lib/calidad-types";

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
}

const parameters = [
  ["Temperatura", "temperatura", "°C"],
  ["Humedad", "humedad", "%"],
  ["Presión", "presion", "inHg"],
  ["Tiempo de exposición", "tiempo_exposicion", "min"],
  ["Tiempo de aireación / secado", "tiempo_aireacion", "min"],
] as const;

export default function RevisarCicloPage() {
  const params = useParams<{ ciclo_id: string }>();
  const router = useRouter();
  const cicloId = Number(params.ciclo_id);
  const [ciclo, setCiclo] = useState<CicloCalidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [motivo, setMotivo] = useState("");
  const [issuedCertificate, setIssuedCertificate] = useState<CertificadoEsterilizacion | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(cicloId) || cicloId < 1) return () => { active = false; };
    api.get<CicloCalidad>(`/calidad/ciclos/${cicloId}`)
      .then(({ data }) => { if (active) setCiclo(data); })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause, "No se pudo cargar el ciclo para revisión."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cicloId]);

  async function handleApprove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ciclo) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post<CertificadoEsterilizacion>("/calidad/aprobar", {
        ciclo_id: ciclo.id,
        password,
      });
      setIssuedCertificate(data);
      setApprovalOpen(false);
      setPassword("");
      setSaving(false);
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo aprobar el ciclo. Verifica la contraseña y vuelve a intentarlo."));
      setSaving(false);
    }
  }

  async function handleDownloadCertificate() {
    if (!issuedCertificate) return;
    setDownloadingCertificate(true);
    setError("");
    try {
      await downloadPdfFromBackend(
        `/certificados/${issuedCertificate.id}/descargar`,
        `CERTIFICADO-${issuedCertificate.consecutivo}.pdf`,
      );
    } catch {
      setError(`No se pudo descargar el certificado ${issuedCertificate.consecutivo}.`);
    } finally {
      setDownloadingCertificate(false);
    }
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ciclo) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/calidad/rechazar", { ciclo_id: ciclo.id, motivo });
      router.replace("/calidad");
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo rechazar el ciclo."));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link href="/calidad" className="inline-flex items-center gap-2 text-sm font-semibold text-sterinova-teal hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Calidad
      </Link>

      {!Number.isInteger(cicloId) || cicloId < 1 ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">El ciclo solicitado no es válido.</p>
      ) : loading ? (
        <div className="rounded-xl bg-white p-12 text-center text-sterinova-teal shadow-sm">Cargando datos del ciclo...</div>
      ) : error && !ciclo ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
      ) : ciclo ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sterinova-teal">Revisión de ciclo #{ciclo.id}</p>
              <h1 className="mt-1 text-3xl font-bold text-sterinova-dark">Orden {ciclo.orden?.consecutivo ?? `#${ciclo.orden_id}`}</h1>
              <p className="mt-1 text-slate-600">{ciclo.orden?.cotizacion?.cliente?.razon_social ?? "Cliente sin nombre"}</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-900">Pendiente de Calidad</span>
          </header>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
          ) : null}

          {issuedCertificate ? (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5" role="status">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Aprobación completada</p>
                <h2 className="mt-1 text-xl font-bold text-emerald-950">
                  Certificado {issuedCertificate.consecutivo} emitido exitosamente
                </h2>
                <p className="mt-1 text-sm text-emerald-800">El PDF oficial quedó guardado en el servidor.</p>
              </div>
              <button
                type="button"
                onClick={() => void handleDownloadCertificate()}
                disabled={downloadingCertificate || !issuedCertificate.pdf_url}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingCertificate ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
                {downloadingCertificate ? "Descargando..." : "Descargar Certificado"}
              </button>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Método", ciclo.metodo === "ETO" ? "EtO" : "Vapor"],
              ["Equipo", ciclo.equipo],
              ["Operador", ciclo.operador?.nombre ?? "—"],
              ["Fecha de proceso", formatDate(ciclo.fecha_proceso)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-sterinova-dark/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-sterinova-dark">{value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-sterinova-dark">Parámetros del proceso</h2>
              <p className="mt-1 text-sm text-slate-500">Valores registrados por Planta para su validación.</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {parameters.map(([label, key, unit]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 text-lg font-bold text-sterinova-dark">{ciclo[key]} <span className="text-sm font-medium text-slate-500">{unit}</span></dd>
                </div>
              ))}
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Control biológico</p>
                <p className="mt-1 font-semibold text-sterinova-dark">{ciclo.control_biologico || "Sin resultado"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Control químico</p>
                <p className="mt-1 font-semibold text-sterinova-dark">{ciclo.control_quimico || "Sin resultado"}</p>
              </div>
            </div>
            {ciclo.orden?.cotizacion?.items?.length ? (
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-bold text-sterinova-dark">Detalle de materiales relacionado a la orden</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {ciclo.orden.cotizacion.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4"><span>{item.descripcion}</span><span className="font-semibold">{item.cantidad}</span></li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {!issuedCertificate ? <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => { setError(""); setRejectOpen(true); }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" aria-hidden /> Rechazar
            </button>
            <button
              type="button"
              onClick={() => { setError(""); setApprovalOpen(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              <Check className="h-4 w-4" aria-hidden /> Aprobar y Emitir Certificado
            </button>
          </div> : null}
        </>
      ) : null}

      {approvalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <form onSubmit={handleApprove} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl" aria-labelledby="approval-title">
            <div>
              <h2 id="approval-title" className="text-xl font-bold text-sterinova-dark">Confirmar firma electrónica</h2>
              <p className="mt-1 text-sm text-slate-600">Vuelve a ingresar la contraseña del Coordinador de Calidad para aprobar el ciclo y emitir el certificado.</p>
            </div>
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Contraseña de Calidad
              <input autoFocus required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/20" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setApprovalOpen(false); setPassword(""); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                {saving ? "Validando..." : "Confirmar y emitir"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {rejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <form onSubmit={handleReject} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl" aria-labelledby="reject-title">
            <div>
              <h2 id="reject-title" className="text-xl font-bold text-sterinova-dark">Rechazar ciclo</h2>
              <p className="mt-1 text-sm text-slate-600">El motivo quedará registrado con tu identidad y fecha de revisión.</p>
            </div>
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Motivo del rechazo
              <textarea autoFocus required minLength={1} maxLength={2000} rows={4} value={motivo} onChange={(event) => setMotivo(event.target.value)} className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setRejectOpen(false); setMotivo(""); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
                {saving ? "Guardando..." : "Confirmar rechazo"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
