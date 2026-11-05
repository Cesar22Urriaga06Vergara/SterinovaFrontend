import { Suspense } from 'react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { CotizacionPDF } from '@/components/pdf/CotizacionPDF';
import { cotizacionFromPdfSnapshot, formatMetadataFromSnapshot } from '@/lib/pdf-render-data';
import { readPdfRenderToken } from '@/lib/pdf-render-token';

export default function RenderCotizacionPage() {
  return <Suspense fallback={<main className="pdf-render-page" />}><RenderCotizacionDocument /></Suspense>;
}

function decodeSnapshot(token: string, secret: string) {
  try {
    return readPdfRenderToken(token, 'cotizacion', secret);
  } catch {
    notFound();
  }
}

async function RenderCotizacionDocument() {
  await connection();
  const requestHeaders = await headers();
  const token = requestHeaders.get('x-pdf-render-token');
  const secret = process.env.PDF_RENDER_SECRET ?? '';
  if (!token || !secret) notFound();

  const snapshot = decodeSnapshot(token, secret);
  const formato = snapshot.formato as Record<string, unknown>;
  return (
    <main className="pdf-print-root pdf-render-page">
      <CotizacionPDF
        data={cotizacionFromPdfSnapshot(snapshot)}
        metadata={formatMetadataFromSnapshot(formato)}
      />
    </main>
  );
}
