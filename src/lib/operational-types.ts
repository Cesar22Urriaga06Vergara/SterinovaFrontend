export type MaterialRecibido = {
  id?: number;
  posicion?: number;
  cotizacion_item_id?: number | null;
  descripcion: string;
  referencia: string | null;
  lote: string | null;
  cantidad: number;
  empaque: string | null;
  muestras_retencion: number | null;
  muestras_cliente: number | null;
  muestras_laboratorio: number | null;
  cantidad_recibida?: number | null;
  cajas_recibidas?: number | null;
  cantidad_entregada?: number | null;
  cajas_entregadas?: number | null;
  visto_bueno?: boolean | null;
  devolucion_registrada?: boolean;
  cantidad_devuelta?: number;
};
export type FilaProtocolo = {
  parametro: string;
  unidad: string | null;
  opciones: string[];
  aplicable: boolean;
};
export type ProtocoloVersion = {
  id: number;
  version: number;
  metodo: "ETO" | "VAPOR";
  especificaciones_json: {
    filas: FilaProtocolo[];
    pendientes_calidad?: string[];
  };
};
export type EvaluacionParametro = {
  parametro: string;
  criterio: "CUMPLE" | "NO_CUMPLE" | "NO_APLICA";
  opcion: number;
};
export type TechnicalRow = {
  parametro: string;
  unidad: string | null;
  especificacion: string;
  resultado: string | number;
  criterio: string;
};
export type InformacionTecnica = {
  metodo: "ETO" | "VAPOR";
  tablas: { ETO: TechnicalRow[]; VAPOR: TechnicalRow[] };
};
export type FrozenSeal = {
  sello_id: number;
  version_id: number;
  version: number;
  sha256: string;
  imagen_key: string;
  mime_type: string;
  imagen_src: string;
  nombre_norma?: string;
  numero_licencia?: string;
  aplica_a?: string[] | null;
};
export type DocumentPerson = {
  id?: number;
  nombre: string;
  apellido?: string | null;
  cargo?: string | null;
};

export const PARAMETER_LABELS: Record<string, string> = {
  temperatura: "Temperatura",
  humedad: "Humedad relativa",
  presion: "Presión",
  tiempo_exposicion: "Tiempo de exposición",
  tiempo_aireacion: "Aireación",
  tiempo_secado: "Tiempo de secado",
  humedad_presion: "Humedad/Presión",
};
