"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, LoaderCircle } from "lucide-react";
import { api, API_BASE_URL, downloadPdfFromBackend } from "@/lib/api";
import type { CertificadoEsterilizacion } from "@/lib/calidad-types";
import { CertificadoPDF } from "@/components/pdf/CertificadoPDF";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === "string") return response.data.message;
  }
  return "No se pudo cargar el certificado.";
}

export default function CertificadoDescargaPage() {
  const params = useParams<{ id: string }>();
  const certificateId = Number(params.id);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [certificate, setCertificate] = useState<CertificadoEsterilizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(certificateId) || certificateId < 1) return () => { active = false; };
    api.get<CertificadoEsterilizacion>(`/certificados/${certificateId}`)
      .then(({ data }) => { if (active) setCertificate(data); })
      .catch((cause: unknown) => { if (active) setError(errorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [certificateId]);

  async function downloadPdf() {
    if (!certificate) return;
    setDownloading(true);
    setError("");
    try {
      await downloadPdfFromBackend(
        `/certificados/${certificate.id}/descargar`,
        `CERTIFICADO-ESTERILIZACION-${certificate.consecutivo}.pdf`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar el PDF oficial.");
    } finally {
      setDownloading(false);
    }
  }

  const validationUrl = certificate
    ? new URL(`/certificados/validar/${encodeURIComponent(certificate.token_publico)}`, API_BASE_URL).toString()
    : "";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/calidad" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-sterinova-teal hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a Calidad
          </Link>
          <h1 className="text-3xl font-bold text-sterinova-dark">
            Certificado {certificate?.consecutivo ?? ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Documento oficial de esterilización · R-AQ-09 · Versión 05</p>
        </div>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={loading || downloading || !certificate?.pdf_url}
          className="inline-flex items-center gap-2 rounded-lg bg-sterinova-dark px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-sterinova-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          {downloading ? "Descargando PDF..." : "Descargar PDF Oficial"}
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
      {!Number.isInteger(certificateId) || certificateId < 1 ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">El certificado solicitado no es válido.</p> : null}
      {loading && Number.isInteger(certificateId) ? <div className="rounded-xl bg-white p-10 text-center text-sterinova-teal">Cargando certificado...</div> : null}
      {!loading && certificate ? (
        <>
          <div className="overflow-auto rounded-xl bg-slate-200 p-4 shadow-inner print:overflow-visible print:bg-white print:p-0">
            <div className="pdf-print-root certificate-print-root mx-auto w-fit">
              <CertificadoPDF ref={pdfRef} data={certificate} />
            </div>
          </div>
          <p className="text-center text-xs text-slate-500">
            El código QR valida el certificado en <a className="font-semibold text-sterinova-teal underline" href={validationUrl} target="_blank" rel="noreferrer">{validationUrl}</a>
          </p>
        </>
      ) : null}
    </div>
  );
}
