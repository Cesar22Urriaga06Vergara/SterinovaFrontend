import { OrdenServicio } from "./logistica-types";

export type MetodoEsterilizacion = "ETO" | "VAPOR";

export type CicloEsterilizacion = {
  id: number;
  orden_id: number;
  orden: OrdenServicio;
  equipo: string;
  metodo: MetodoEsterilizacion;
  operador_id: number;
  operador: { id: number; nombre: string };
  temperatura: number;
  humedad: number;
  presion: number;
  tiempo_exposicion: number;
  tiempo_aireacion: number;
  control_biologico: string;
  control_quimico: string;
  fecha_proceso: string;
  estado: "EN_PROCESO" | "PENDIENTE_CALIDAD" | "APROBADO" | "RECHAZADO";
};
