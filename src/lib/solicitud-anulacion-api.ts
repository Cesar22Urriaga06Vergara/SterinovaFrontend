import { api } from "@/lib/api";
import type {
  DecisionSolicitud,
  SolicitudAnulacion,
} from "@/lib/solicitud-anulacion-types";

export async function crearSolicitud(
  cotizacionId: number,
  motivo: string,
  headers?: Record<string, string>,
): Promise<SolicitudAnulacion> {
  const { data } = await api.post<SolicitudAnulacion>(
    `/cotizaciones/${cotizacionId}/solicitud-anulacion`,
    { motivo },
    { headers },
  );
  return data;
}

export async function obtenerPendientes(
  headers?: Record<string, string>,
): Promise<SolicitudAnulacion[]> {
  const { data } = await api.get<SolicitudAnulacion[]>(
    "/solicitudes-anulacion/pendientes",
    { headers },
  );
  return data;
}

export async function resolverSolicitud(
  id: number,
  estado: DecisionSolicitud,
  observacion: string,
  headers?: Record<string, string>,
): Promise<SolicitudAnulacion> {
  const { data } = await api.patch<SolicitudAnulacion>(
    `/solicitudes-anulacion/${id}/resolver`,
    { estado, observacion },
    { headers },
  );
  return data;
}
