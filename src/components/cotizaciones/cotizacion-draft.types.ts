import type { CategoriaProducto, TipoItemCatalogo } from "@/lib/producto-types";

export type DraftItem = {
  key: string; id?: number; producto_id?: number; tipo_item: TipoItemCatalogo;
  categoria?: CategoriaProducto; codigo: string; referencia: string; metodo: string;
  presentacion: string; marca: string; descripcion: string; unidad: string;
  precision_cantidad: number; imagen_key?: string | null; imagen_mime_type?: string | null;
  imagenFile?: File; incluir_imagen: boolean; quitar_imagen: boolean;
  cantidad: string; valor_unitario: string;
};

export const COMMERCIAL_CONDITIONS = [
  ["TIEMPO DE DESPACHO", "tiempo_despacho"], ["TRANSPORTE", "transporte"],
  ["FORMA DE PAGO", "forma_pago"], ["VALIDEZ DE LA OFERTA", "validez_oferta"],
  ["EL PRECIO INCLUYE", "precio_incluye"], ["EL PRECIO NO INCLUYE", "precio_no_incluye"],
] as const;
export type CommercialConditionField = (typeof COMMERCIAL_CONDITIONS)[number][1];
export type CommercialConditions = Record<CommercialConditionField, string>;

export const emptyCommercialConditions = (): CommercialConditions => ({
  tiempo_despacho: "", transporte: "", forma_pago: "", validez_oferta: "",
  precio_incluye: "", precio_no_incluye: "",
});

export function createEmptyItem(): DraftItem {
  return { key: crypto.randomUUID(), tipo_item: "SERVICIO", codigo: "", referencia: "", metodo: "",
    presentacion: "", marca: "", descripcion: "", unidad: "servicio", precision_cantidad: 0,
    incluir_imagen: false, quitar_imagen: false, cantidad: "1", valor_unitario: "0" };
}
