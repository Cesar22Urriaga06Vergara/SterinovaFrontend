import { LegacyCertificadoPDF } from '@/components/pdf/LegacyCertificadoPDF';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { CertificadoPDF } from '@/components/pdf/CertificadoPDF';
import { certificadoFromPdfSnapshot } from '@/lib/pdf-render-data';
import { readPdfRenderToken } from '@/lib/pdf-render-token';

export default function RenderCertificadoPage() {
  return <Suspense fallback={<main className="pdf-render-page" />}><RenderCertificadoDocument /></Suspense>;
}

function decodeSnapshot(token: string, secret: string) {
  try {
    return readPdfRenderToken(token, 'certificado', secret);
  } catch {
    notFound();
  }
}

async function RenderCertificadoDocument() {
  await connection();
  const requestHeaders = await headers();
  const token = requestHeaders.get('x-pdf-render-token');
  const secret = process.env.PDF_RENDER_SECRET ?? '';
  if (!token || !secret) notFound();

  const snapshot = decodeSnapshot(token, secret);
  const Renderer=snapshot.schema_version===2?CertificadoPDF:LegacyCertificadoPDF;
  return (
    <main className="pdf-print-root pdf-render-page">
      <Renderer data={certificadoFromPdfSnapshot(snapshot)} />
    </main>
  );
}
