export type EstadoSolicitud = "PENDIENTE" | "APROBADA" | "RECHAZADA";
export type DecisionSolicitud = Exclude<EstadoSolicitud, "PENDIENTE">;

export interface SolicitudAnulacion {
  id: number;
  cotizacion_id: number;
  creador_id: number;
  aprobador_id: number | null;
  motivo: string;
  estado: EstadoSolicitud;
  created_at: string;
  fecha_resolucion: string | null;
  observacion_resolucion: string | null;
  creador?: { nombre: string; apellido?: string | null };
  cotizacion?: {
    id: number;
    consecutivo: string;
    cliente_id: number;
    cliente?: { razon_social: string };
  };
}

export function puedeSolicitarAnulacion(
  estado: string,
  tienePermiso: boolean,
): boolean {
  return tienePermiso && ["EMITIDA", "APROBADA"].includes(estado);
}

export function puedeResolverSolicitud(
  estado: string,
  observacion: string,
): boolean {
  return (
    estado === "APROBADA" ||
    (estado === "RECHAZADA" && observacion.trim().length > 0)
  );
}
