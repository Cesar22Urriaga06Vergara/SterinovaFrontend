import { Suspense } from "react";
import CotizacionForm from "@/components/cotizaciones/CotizacionForm";

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CotizacionForm key={id} quoteId={id} />;
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p role="status">Cargando borrador...</p>}><EditForm params={params} /></Suspense>;
}
