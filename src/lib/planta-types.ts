import type { ProtocoloVersion,DocumentPerson } from './operational-types';
import { OrdenServicio } from "./logistica-types";

export type MetodoEsterilizacion = "ETO" | "VAPOR";

export type CicloEsterilizacion = {
  id: number;
  orden_id: number;
  orden: OrdenServicio;
  equipo: string;
  metodo: MetodoEsterilizacion;
  operador_id: number;
  operador: DocumentPerson;
  fecha_esterilizacion?: string|null;
  protocolo_version_id?:number|null;
  protocolo_version?:ProtocoloVersion|null;
  tiempo_secado?:number|string|null;
  temperatura: number;
  humedad: number|null;
  presion: number|null;
  tiempo_exposicion: number;
  tiempo_aireacion: number|null;
  control_biologico: string;
  control_quimico: string;
  fecha_proceso: string;
  estado: "EN_PROCESO" | "PENDIENTE_CALIDAD" | "APROBADO" | "RECHAZADO";
};
