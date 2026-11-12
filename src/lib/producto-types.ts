import type { TipoServicioCotizacion } from "./cotizacion-types";

export type TipoItemCatalogo = "PRODUCTO" | "SERVICIO";
export type CategoriaProducto =
  | "EMPAQUES"
  | "MONITOREO"
  | "EQUIPOS"
  | "GENERAL";

export type ProductoCatalogo = {
  id: number;
  scope_id: number;
  tipo_servicio: TipoServicioCotizacion;
  tipo_item: TipoItemCatalogo;
  categoria: CategoriaProducto | null;
  codigo: string | null;
  referencia: string | null;
  metodo: string | null;
  presentacion: string | null;
  marca: string | null;
  descripcion: string;
  unidad: string;
  precision_cantidad: number;
  activo: boolean;
};
