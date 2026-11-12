import type { CicloEsterilizacion } from "./planta-types";

export type CicloCalidad = CicloEsterilizacion & {
  orden: CicloEsterilizacion["orden"] & {
    cotizacion?: {
      cliente?: { razon_social: string; nit: string };
      items?: Array<{
        id: number;
        descripcion: string;
        cantidad: number | string;
      }>;
    };
  };
  revisado_por?: number | null;
  revisado_en?: string | null;
  motivo_rechazo?: string | null;
};

export type CertificadoEsterilizacion = {
  id: number;
  consecutivo: string;
  token_publico: string;
  ciclo_id: number;
  ciclo: string | null;
  equipo: string | null;
  estado: string;
  created_at: string;
  aprobado_at: string | null;
  fecha_emision?: string | null;
  fecha_esterilizacion?:string|null;
  fecha_vencimiento?: string | null;
  pdf_url?: string | null;
  hash_pdf?: string | null;
  snapshot_datos?: Record<string, unknown> | null;
  parametros_tecnicos: Record<string, unknown> | null;
  controles_biologicos: string | null;
  cicloEsterilizacion: CicloCalidad;
  aprobador: { id: number; nombre: string } | null;
};

export type ValidacionCertificado = {
  valido: boolean;
  consecutivo: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  cliente: string | null;
  metodo: "ETO" | "VAPOR";
  estado: string;
};
