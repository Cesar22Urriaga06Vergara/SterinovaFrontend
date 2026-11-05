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
  return (
    <main className="pdf-print-root pdf-render-page">
      <CertificadoPDF data={certificadoFromPdfSnapshot(snapshot)} />
    </main>
  );
}
