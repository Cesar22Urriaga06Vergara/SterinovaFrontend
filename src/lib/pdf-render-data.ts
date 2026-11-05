import type { Cotizacion, TipoServicioCotizacion } from './cotizacion-types';
import type { CertificadoEsterilizacion } from './calidad-types';

type Snapshot = Record<string, unknown>;

export type PdfFormatMetadata = {
  codigo: string;
  versionLabel: string;
  fechaVersion: string;
  title?: string;
};

export function formatMetadataFromSnapshot(formato: Snapshot): PdfFormatMetadata {
  const config = (formato.configuracion_json ?? {}) as Record<string, unknown>;
  const rawDate = String(config.version_date ?? formato.fecha_version ?? '');
  const dateParts = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return {
    codigo: String(formato.codigo ?? config.document_code ?? ''),
    versionLabel: String(config.version_label ?? formato.version ?? ''),
    fechaVersion: dateParts ? `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}` : rawDate,
    title: typeof config.title === 'string' ? config.title : undefined,
  };
}

export function cotizacionFromPdfSnapshot(snapshot: Snapshot): Cotizacion {
  const quote = (snapshot.cotizacion ?? {}) as Record<string, unknown>;
  const document = (snapshot.documento ?? {}) as Record<string, unknown>;
  const cliente = snapshot.cliente as Cotizacion['cliente'];
  return {
    id: Number(document.id ?? 0),
    consecutivo: String(document.consecutivo ?? ''),
    fecha: String(quote.fecha ?? ''),
    tipo_servicio: quote.tipo_servicio as TipoServicioCotizacion,
    estado: 'EMITIDA',
    fecha_emision: typeof document.fecha_emision === 'string' ? document.fecha_emision : null,
    cliente_id: Number(cliente?.id ?? 0),
    cliente,
    items: (quote.items ?? []) as Cotizacion['items'],
    subtotal: (quote.subtotal ?? 0) as Cotizacion['subtotal'],
    iva: (quote.iva ?? 0) as Cotizacion['iva'],
    total: (quote.total ?? 0) as Cotizacion['total'],
    condiciones_comerciales: typeof quote.condiciones_comerciales === 'string' ? quote.condiciones_comerciales : null,
  };
}

export function certificadoFromPdfSnapshot(snapshot: Snapshot): CertificadoEsterilizacion {
  const cycle = (snapshot.ciclo_esterilizacion ?? {}) as Record<string, unknown>;
  const certificate = (snapshot.certificado ?? {}) as Record<string, unknown>;
  const document = (snapshot.documento ?? {}) as Record<string, unknown>;
  const order = (cycle.orden ?? {}) as Record<string, unknown>;
  const orderCotizacion = (order.cotizacion ?? null) as Record<string, unknown> | null;
  const legacyOrder = (snapshot.orden_servicio ?? {}) as Record<string, unknown>;
  const legacyCotizacion = (snapshot.cotizacion ?? null) as Record<string, unknown> | null;
  const cliente = snapshot.cliente ?? null;
  const resolvedOrderCotizacion = orderCotizacion ?? (
    legacyCotizacion ? { ...legacyCotizacion, cliente } : null
  );
  const resolvedOrder = Object.keys(order).length ? order : legacyOrder;
  const approver = snapshot.aprobador ?? (
    typeof document.aprobador === 'string' ? { nombre: document.aprobador } : null
  );
  const cycleWithOrder = {
    ...cycle,
    id: Number(cycle.id ?? 0),
    orden: {
      ...resolvedOrder,
      consecutivo: resolvedOrder.consecutivo ?? '',
      cotizacion: resolvedOrderCotizacion,
    },
  } as unknown as CertificadoEsterilizacion['cicloEsterilizacion'];
  return {
    id: Number(document.id ?? 0),
    consecutivo: String(document.consecutivo ?? certificate.consecutivo ?? ''),
    token_publico: String(certificate.token_publico ?? document.token_publico ?? ''),
    ciclo_id: Number(cycle.id ?? 0),
    ciclo: String(certificate.ciclo ?? cycle.id ?? ''),
    equipo: String(cycle.equipo ?? ''),
    estado: 'Aprobado',
    created_at: String(document.fecha_emision ?? ''),
    aprobado_at: String(document.fecha_emision ?? ''),
    fecha_emision: String(document.fecha_emision ?? ''),
    fecha_vencimiento: String(document.fecha_vencimiento ?? ''),
    parametros_tecnicos: cycle,
    controles_biologicos: String(certificate.controles_biologicos ?? ''),
    aprobador: approver as CertificadoEsterilizacion['aprobador'],
    snapshot_datos: snapshot,
    cicloEsterilizacion: cycleWithOrder,
  };
}
