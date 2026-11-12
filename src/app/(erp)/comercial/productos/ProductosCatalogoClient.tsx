"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useQuoteHeaders, useSession } from "@/lib/session";
import type {
  CategoriaProducto,
  ProductoCatalogo,
  TipoItemCatalogo,
} from "@/lib/producto-types";
import {
  TIPOS_SERVICIO,
  type TipoServicioCotizacion,
} from "@/lib/cotizacion-types";

type ProductoForm = {
  tipo_servicio: TipoServicioCotizacion;
  tipo_item: TipoItemCatalogo;
  categoria: CategoriaProducto | "";
  codigo: string;
  referencia: string;
  metodo: string;
  presentacion: string;
  marca: string;
  descripcion: string;
  unidad: string;
  precision_cantidad: number;
};

const emptyForm = (): ProductoForm => ({
  tipo_servicio: "INDUSTRIAL_ETO",
  tipo_item: "PRODUCTO",
  categoria: "",
  codigo: "",
  referencia: "",
  metodo: "",
  presentacion: "",
  marca: "",
  descripcion: "",
  unidad: "",
  precision_cantidad: 0,
});

export default function ProductosCatalogoClient() {
  const router = useRouter();
  const { can, current_scope } = useSession();
  const headers = useQuoteHeaders();
  const allowed = can("productos.gestionar");
  const [products, setProducts] = useState<ProductoCatalogo[]>([]);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) {
      router.replace("/comercial");
      return;
    }
    if (!current_scope || current_scope.kind === "GLOBAL") {
      return;
    }
    let active = true;
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get<ProductoCatalogo[]>("/productos", { headers });
        if (active) setProducts(data);
      } catch (cause) {
        if (active) setError(getApiErrorMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProducts();
    return () => {
      active = false;
    };
  }, [allowed, current_scope, headers, router]);

  function updateForm<K extends keyof ProductoForm>(
    field: K,
    value: ProductoForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function editProduct(product: ProductoCatalogo) {
    setForm({
      tipo_servicio: product.tipo_servicio,
      tipo_item: product.tipo_item,
      categoria: product.categoria ?? "",
      codigo: product.codigo ?? "",
      referencia: product.referencia ?? "",
      metodo: product.metodo ?? "",
      presentacion: product.presentacion ?? "",
      marca: product.marca ?? "",
      descripcion: product.descripcion,
      unidad: product.unidad,
      precision_cantidad: product.precision_cantidad,
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allowed || saving) return;
    setSaving(true);
    setError("");
    const { categoria, ...rest } = form;
    const payload = {
      ...rest,
      ...(form.tipo_servicio === "INSUMOS" && categoria
        ? { categoria }
        : {}),
    };
    try {
      if (editingId) {
        const { data } = await api.put<ProductoCatalogo>(
          `/productos/${editingId}`,
          payload,
          { headers },
        );
        setProducts((current) =>
          current.map((product) => (product.id === data.id ? data : product)),
        );
      } else {
        const { data } = await api.post<ProductoCatalogo>(
          "/productos",
          payload,
          { headers },
        );
        setProducts((current) => [...current, data]);
      }
      resetForm();
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: ProductoCatalogo) {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch<ProductoCatalogo>(
        `/productos/${product.id}/estado`,
        { activo: !product.activo },
        { headers },
      );
      setProducts((current) =>
        current.map((item) => (item.id === data.id ? data : item)),
      );
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  if (!allowed) return null;
  if (!current_scope || current_scope.kind === "GLOBAL") {
    return <p role="alert">Selecciona un ámbito operativo para administrar el catálogo.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-sterinova-dark">Catálogo de productos y servicios</h1>
        <p className="mt-1 text-sterinova-teal">
          Referencias del ámbito {current_scope.name}. Los precios se definen en cada cotización.
        </p>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-sterinova-dark/10">
        <h2 className="text-lg font-semibold text-sterinova-dark">
          {editingId ? "Editar referencia" : "Agregar referencia"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Tipo de cotización</span>
            <select required value={form.tipo_servicio}
              onChange={(event) => {
                const tipo_servicio = event.target.value as TipoServicioCotizacion;
                setForm((current) => ({
                  ...current,
                  tipo_servicio,
                  categoria: tipo_servicio === "INSUMOS" ? current.categoria : "",
                }));
              }}
              className="w-full rounded-lg border bg-sterinova-light px-3 py-2">
              {TIPOS_SERVICIO.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Tipo de ítem</span>
            <select required value={form.tipo_item}
              onChange={(event) => updateForm("tipo_item", event.target.value as TipoItemCatalogo)}
              className="w-full rounded-lg border bg-sterinova-light px-3 py-2">
              <option value="PRODUCTO">Producto</option>
              <option value="SERVICIO">Servicio</option>
            </select>
          </label>
          {form.tipo_servicio === "INSUMOS" ? (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Categoría</span>
              <select required value={form.categoria}
                onChange={(event) => updateForm("categoria", event.target.value as CategoriaProducto | "")}
                className="w-full rounded-lg border bg-sterinova-light px-3 py-2">
                <option value="">Seleccione...</option>
                <option value="EMPAQUES">Empaques</option>
                <option value="MONITOREO">Monitoreo</option>
                <option value="EQUIPOS">Equipos</option>
              </select>
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Descripción</span>
            <input required maxLength={500} value={form.descripcion}
              onChange={(event) => updateForm("descripcion", event.target.value)}
              className="w-full rounded-lg border bg-sterinova-light px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Unidad</span>
            <input required maxLength={80} value={form.unidad}
              onChange={(event) => updateForm("unidad", event.target.value)}
              placeholder="unidad, caja, kg..."
              className="w-full rounded-lg border bg-sterinova-light px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Decimales permitidos en cantidad</span>
            <select value={form.precision_cantidad}
              onChange={(event) => updateForm("precision_cantidad", Number(event.target.value))}
              className="w-full rounded-lg border bg-sterinova-light px-3 py-2">
              <option value={0}>0 decimales</option>
              <option value={1}>1 decimal</option>
              <option value={2}>2 decimales</option>
            </select>
          </label>
          {([
            ["Código", "codigo", 80],
            ["Referencia", "referencia", 160],
            ["Método", "metodo", 120],
            ["Presentación", "presentacion", 160],
            ["Marca", "marca", 120],
          ] as const).map(([label, field, maxLength]) => (
            <label key={field} className="block text-sm">
              <span className="mb-1 block font-medium">{label} (opcional)</span>
              <input maxLength={maxLength} value={form[field]}
                onChange={(event) => updateForm(field, event.target.value)}
                className="w-full rounded-lg border bg-sterinova-light px-3 py-2" />
            </label>
          ))}
          <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
            {editingId ? (
              <button type="button" onClick={resetForm} disabled={saving}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-60">
                Cancelar edición
              </button>
            ) : null}
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {editingId ? <Pencil className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar al catálogo"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
        <div className="border-b border-sterinova-dark/10 px-5 py-4">
          <h2 className="font-semibold text-sterinova-dark">Referencias del ámbito</h2>
          <p className="text-sm text-sterinova-teal">{products.length} referencias · Las desactivadas se conservan en borradores históricos.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-sterinova-light text-sterinova-dark">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Código / referencia</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Unidad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sterinova-dark/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center">Cargando catálogo...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sterinova-dark/70">Aún no hay referencias en este ámbito.</td></tr>
              ) : products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <span className="block">{TIPOS_SERVICIO.find((type) => type.value === product.tipo_servicio)?.label ?? product.tipo_servicio}</span>
                    <span className="text-xs text-sterinova-dark/70">
                      {product.tipo_item === "PRODUCTO" ? "Producto" : "Servicio"}{product.categoria ? ` · ${product.categoria}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">{[product.codigo, product.referencia].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="block font-medium">{product.descripcion}</span>
                    {[product.metodo, product.presentacion, product.marca].filter(Boolean).join(" · ") || null}
                  </td>
                  <td className="px-4 py-3">{product.unidad} · {product.precision_cantidad} dec.</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => editProduct(product)} disabled={saving}
                        className="inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
                      </button>
                      <button type="button" onClick={() => void toggleActive(product)} disabled={saving}
                        className="inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60">
                        {product.activo ? <ShieldOff className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                        {product.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
