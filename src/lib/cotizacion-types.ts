import type { ClienteDatosDocumento } from "./cliente-types";

export type { Cliente } from "./cliente-types";

export type TipoServicioCotizacion =
  | "INDUSTRIAL_ETO"
  | "INSTITUCIONAL_ETO"
  | "INSTITUCIONAL_VAPOR"
  | "INSUMOS"
  | "LAVANDERIA";

export const TIPOS_SERVICIO: {
  value: TipoServicioCotizacion;
  label: string;
}[] = [
  { value: "INDUSTRIAL_ETO", label: "Industrial EtO" },
  { value: "INSTITUCIONAL_ETO", label: "Institucional EtO" },
  { value: "INSTITUCIONAL_VAPOR", label: "Institucional Vapor" },
  { value: "INSUMOS", label: "Insumos" },
  { value: "LAVANDERIA", label: "Lavandería" },
];

export type CotizacionItem = {
  id?: number;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
};

export type Cotizacion = {
  id: number;
  consecutivo: string;
  fecha: string;
  tipo_servicio: TipoServicioCotizacion;
  estado: string;
  fecha_emision?: string | null;
  pdf_url?: string | null;
  hash_pdf?: string | null;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
  condiciones_comerciales?: string | null;
  cliente_id: number;
  creador_id?: number | null;
  creador?: {
    id?: number;
    nombre: string;
    apellido?: string | null;
    cargo?: string | null;
    celular?: string | null;
    email_contacto?: string | null;
  } | null;
  cliente?: ClienteDatosDocumento;
  items?: CotizacionItem[];
};

export function labelTipoServicio(tipo: TipoServicioCotizacion): string {
  return TIPOS_SERVICIO.find((t) => t.value === tipo)?.label ?? tipo;
}

export function formatearMoneda(value: string | number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatCurrency(value: string | number): string {
  return formatearMoneda(value);
}
