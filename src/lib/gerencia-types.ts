export type IndicadorGerencia =
  | "cotizaciones_creadas"
  | "cotizaciones_emitidas"
  | "ordenes_creadas"
  | "ciclos_realizados"
  | "ciclos_aprobados"
  | "ciclos_rechazados"
  | "certificados_emitidos"
  | "entregas"
  | "cotizaciones_borrador"
  | "cotizaciones_por_emitir"
  | "ordenes_abiertas"
  | "calidad_por_revisar";

export type MetricaGerencia = {
  indicador: IndicadorGerencia;
  valor: number;
  periodo: string;
};

export type ResumenGerencia = {
  fecha_desde: string;
  fecha_hasta: string;
  total_cotizaciones: number;
  total_emitidas: number;
  total_ordenes: number;
  total_ciclos: number;
  total_certificados: number;
  indicadores: MetricaGerencia[];
};

export type DetalleIndicador = {
  indicador: IndicadorGerencia;
  fecha: string;
  valor: number;
  etiqueta: string;
};

export type AdministradorArea = {
  id: number;
  nombre: string;
  apellido?: string | null;
  email: string;
  cargo: string | null;
  rol: { id: number; code: string; name: string };
  ambito: { id: number; code: string; name: string; kind: string };
  activo: boolean;
};

export type CrearAdministradorDto = {
  email: string;
  nombre: string;
  apellido?: string;
  cargo?: string;
  celular?: string;
  email_contacto?: string;
  password: string;
  role_id: number;
  scope_id: number;
};
