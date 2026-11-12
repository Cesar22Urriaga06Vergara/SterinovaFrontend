import type { MaterialRecibido } from './operational-types';
import { Cotizacion } from "./cotizacion-types";

export type EstadoOrdenServicio =
  | "PENDIENTE"
  | "EN_RUTA"
  | "RECOGIDO"
  | "EN_PLANTA"
  | "PROCESADO"
  | "ENTREGADO"
  | "CANCELADO";

export type EventoOrden = {
  tipo: "RECOGIDA" | "RECEPCION_PLANTA" | "PROCESAMIENTO" | "ENTREGA_CLIENTE";
  ocurrido_at: string;
  responsable: string;
  recibido_por?: string | null;
  entregado_por?: string | null;
  transportista?: string | null;
  observaciones?: string | null;
  materiales: Array<{
    material_id: number;
    cantidad: number;
    cajas?: number;
  }>;
};

export type OrdenServicio = {
  version: number;
  metodo_esterilizacion?: "ETO"|"VAPOR"|null;
  materiales?: MaterialRecibido[];
  id: number;
  consecutivo: string;
  acta_consecutivo?: string | null;
  cotizacion_id: number;
  fecha_programada: string;
  estado: EstadoOrdenServicio;
  conductor_asignado?: string | null;
  vehiculo_placa?: string | null;
  observaciones?: string | null;
  cotizacion?: Cotizacion;
  eventos?: EventoOrden[];
};

export const ESTADO_COLORES: Record<EstadoOrdenServicio, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  EN_RUTA: "bg-blue-100 text-blue-800 ring-blue-200",
  RECOGIDO: "bg-orange-100 text-orange-800 ring-orange-200",
  EN_PLANTA: "bg-green-100 text-green-800 ring-green-200",
  PROCESADO: "bg-purple-100 text-purple-800 ring-purple-200",
  ENTREGADO: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELADO: "bg-gray-100 text-gray-700 ring-gray-200",
};

export const ESTADO_LABELS: Record<EstadoOrdenServicio, string> = {
  PENDIENTE: "Pendiente",
  EN_RUTA: "En ruta",
  RECOGIDO: "Recogido",
  EN_PLANTA: "En planta",
  PROCESADO: "Procesado",
  ENTREGADO: "Entregado",
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
    case "EN_PLANTA":
      return null;
    case "PROCESADO":
      return { label: "Marcar Entregado", next: "ENTREGADO" };
    default:
      return null;
  }
}
