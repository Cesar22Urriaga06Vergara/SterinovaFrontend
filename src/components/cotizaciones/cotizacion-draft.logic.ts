import type { ProductoCatalogo } from "@/lib/producto-types";
import type { DraftItem } from "./cotizacion-draft.types";

export type ComputedDraftItem = Omit<DraftItem, "cantidad" | "valor_unitario"> & { cantidad: number; valor_unitario: number; valor_total: number };

export function createCatalogDraftItem(product: ProductoCatalogo): DraftItem {
  return { key: crypto.randomUUID(), producto_id: product.id, tipo_item: product.tipo_item,
    ...(product.categoria ? { categoria: product.categoria } : {}), codigo: product.codigo ?? "",
    referencia: product.referencia ?? "", metodo: product.metodo ?? "", presentacion: product.presentacion ?? "",
    marca: product.marca ?? "", descripcion: product.descripcion, unidad: product.unidad || "unidad",
    precision_cantidad: Number.isInteger(product.precision_cantidad) ? product.precision_cantidad : 2, incluir_imagen: false, quitar_imagen: false,
    cantidad: "1", valor_unitario: "0" };
}

export function appendDraftItem(items: DraftItem[], item: DraftItem): DraftItem[] {
  return items.length === 1 && !items[0]?.descripcion.trim() ? [item] : [...items, item];
}

export function calculateDraftItems(items: DraftItem[]): ComputedDraftItem[] {
  return items.map((item) => {
    const cantidad = Number(item.cantidad) || 0;
    const valor_unitario = Number(item.valor_unitario) || 0;
    return { ...item, cantidad, valor_unitario, valor_total: Number((cantidad * valor_unitario).toFixed(2)) };
  });
}
