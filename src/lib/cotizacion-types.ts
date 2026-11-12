import type { FrozenSeal } from './operational-types';
import type { ClienteDatosDocumento } from "./cliente-types";
import type {
  CategoriaProducto,
  TipoItemCatalogo,
} from "./producto-types";

export type { Cliente } from "./cliente-types";

export type TipoServicioCotizacion =
  | "INDUSTRIAL_ETO"
  | "INSTITUCIONAL_ETO"
  | "INSTITUCIONAL_VAPOR"
  | "INSUMOS"
  | "LAVANDERIA"
  | "FARMACEUTICO"
  | "FABRICANTE";

export const TIPOS_SERVICIO: {
  value: TipoServicioCotizacion;
  label: string;
  prefix: string;
}[] = [
  { value: "INDUSTRIAL_ETO", label: "Industrial EtO", prefix: "COT-IND-" },
  {
    value: "INSTITUCIONAL_ETO",
    label: "Institucional EtO",
    prefix: "COT-CME-",
  },
  {
    value: "INSTITUCIONAL_VAPOR",
    label: "Institucional Vapor",
    prefix: "COT-CME-",
  },
  { value: "INSUMOS", label: "Insumos", prefix: "COT-CMI-" },
  { value: "LAVANDERIA", label: "Lavandería", prefix: "COT-LAV-" },
  {
    value: "FARMACEUTICO",
    label: "Farmacéutico",
    prefix: "COT-CEMFA-",
  },
  { value: "FABRICANTE", label: "Fabricante", prefix: "COT-CMED-" },
];

export type CotizacionItem = {
  id?: number;
  producto_id?: number | null;
  tipo_item?: TipoItemCatalogo | null;
  categoria?: CategoriaProducto | null;
  codigo?: string | null;
  referencia?: string | null;
  metodo?: string | null;
  presentacion?: string | null;
  marca?: string | null;
  descripcion: string;
  unidad?: string | null;
  precision_cantidad?: number | null;
  imagen_key?: string | null;
  imagen_sha256?: string | null;
  imagen_mime_type?: string | null;
  imagen_tamano_bytes?: number | null;
  imagen_src?: string | null;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
};

export type Cotizacion = {
  sellos?:{icontec:FrozenSeal};
  version?: number;
  id: number;
  consecutivo: string;
  fecha: string;
  tipo_servicio: TipoServicioCotizacion;
  estado: string;
  aprobador_interno_id?: number | null;
  aprobado_internamente_at?: string | null;
  fecha_emision?: string | null;
  pdf_url?: string | null;
  hash_pdf?: string | null;
  subtotal: string | number;
  iva: string | number;
  iva_tasa?: string | null;
  iva_version_id?: number | null;
  total: string | number;
  condiciones_comerciales?: string | null;
  tiempo_despacho?: string | null;
  transporte?: string | null;
  forma_pago?: string | null;
  validez_oferta?: string | null;
  precio_incluye?: string | null;
  precio_no_incluye?: string | null;
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

export function isEditableDraft(quote: Cotizacion): boolean {
  return quote.estado?.toUpperCase() === "BORRADOR" && !quote.fecha_emision;
}

export function isInternallyApproved(quote: Cotizacion): boolean {
  return (
    quote.estado?.toUpperCase() === "APROBADA" &&
    quote.creador_id != null &&
    quote.aprobador_interno_id != null &&
    quote.aprobado_internamente_at != null &&
    quote.aprobador_interno_id !== quote.creador_id
  );
}
