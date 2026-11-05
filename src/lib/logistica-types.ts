import { Cotizacion } from "./cotizacion-types";

export type EstadoOrdenServicio =
  | "PENDIENTE"
  | "EN_RUTA"
  | "RECOGIDO"
  | "EN_PLANTA"
  | "PROCESADO"
  | "CANCELADO";

export type OrdenServicio = {
  id: number;
  consecutivo: string;
  cotizacion_id: number;
  fecha_programada: string;
  estado: EstadoOrdenServicio;
  conductor_asignado?: string | null;
  vehiculo_placa?: string | null;
  observaciones?: string | null;
  cotizacion?: Cotizacion;
};

export const ESTADO_COLORES: Record<EstadoOrdenServicio, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  EN_RUTA: "bg-blue-100 text-blue-800 ring-blue-200",
  RECOGIDO: "bg-orange-100 text-orange-800 ring-orange-200",
  EN_PLANTA: "bg-green-100 text-green-800 ring-green-200",
  PROCESADO: "bg-purple-100 text-purple-800 ring-purple-200",
  CANCELADO: "bg-gray-100 text-gray-700 ring-gray-200",
};

export const ESTADO_LABELS: Record<EstadoOrdenServicio, string> = {
  PENDIENTE: "Pendiente",
  EN_RUTA: "En ruta",
  RECOGIDO: "Recogido",
  EN_PLANTA: "En planta",
  PROCESADO: "Procesado",
  CANCELADO: "Cancelado",
};

export function nextEstadoAction(
  estado: EstadoOrdenServicio,
): { label: string; next: EstadoOrdenServicio } | null {
  switch (estado) {
    case "PENDIENTE":
      return { label: "Marcar En Ruta", next: "EN_RUTA" };
    case "EN_RUTA":
      return { label: "Marcar como Recogido", next: "RECOGIDO" };
    case "RECOGIDO":
      return { label: "Marcar En Planta", next: "EN_PLANTA" };
    default:
      return null;
  }
}
