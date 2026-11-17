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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";

const OPCIONES_TIPO_ITEM = [
  { value: "PRODUCTO", label: "Producto" },
  { value: "SERVICIO", label: "Servicio" },
];

const OPCIONES_CATEGORIA = [
  { value: "EMPAQUES", label: "Empaques" },
  { value: "MONITOREO", label: "Monitoreo" },
  { value: "EQUIPOS", label: "Equipos" },
];

const OPCIONES_PRECISION = [
  { value: "0", label: "0 decimales" },
  { value: "1", label: "1 decimal" },
  { value: "2", label: "2 decimales" },
];

const CAMPOS_OPCIONALES = [
  ["Código", "codigo", 80],
  ["Referencia", "referencia", 160],
  ["Método", "metodo", 120],
  ["Presentación", "presentacion", 160],
  ["Marca", "marca", 120],
] as const;

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
  const { can } = useSession();
  const headers = useQuoteHeaders();
  const allowed = can("productos.gestionar");
  const [products, setProducts] = useState<ProductoCatalogo[]>([]);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) {
      router.replace("/comercial");
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
  }, [allowed, headers, router]);

  function updateForm<K extends keyof ProductoForm>(
    field: K,
    value: ProductoForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setFormOpen(false);
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
    setFormOpen(true);
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

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Catálogo de productos y servicios"
        description="Productos y servicios reutilizables. Los precios se definen en cada cotización."
        actions={<Button onClick={() => { setForm(emptyForm()); setEditingId(null); setError(""); setFormOpen(true); }}><Plus className="h-4 w-4" aria-hidden />Nueva referencia</Button>}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-card border border-error/30 bg-error-light px-4 py-3 text-body text-error"
        >
          {error}
        </p>
      ) : null}

      <Modal open={formOpen} title={editingId ? "Editar referencia" : "Nueva referencia"} onClose={() => { if (!saving) resetForm(); }}>
        {error ? <p role="alert" className="mb-4 text-sm text-error">{error}</p> : null}
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Select
            label="Tipo de cotización"
            required
            options={TIPOS_SERVICIO}
            value={form.tipo_servicio}
            onChange={(event) => {
              const tipo_servicio = event.target.value as TipoServicioCotizacion;
              setForm((current) => ({
                ...current,
                tipo_servicio,
                categoria: tipo_servicio === "INSUMOS" ? current.categoria : "",
              }));
            }}
          />
          <Select
            label="Tipo de ítem"
            required
            options={OPCIONES_TIPO_ITEM}
            value={form.tipo_item}
            onChange={(event) => updateForm("tipo_item", event.target.value as TipoItemCatalogo)}
          />
          {form.tipo_servicio === "INSUMOS" ? (
            <Select
              label="Categoría"
              required
              placeholder="Seleccione..."
              options={OPCIONES_CATEGORIA}
              value={form.categoria}
              onChange={(event) => updateForm("categoria", event.target.value as CategoriaProducto | "")}
            />
          ) : null}
          <Input
            label="Descripción"
            required
            maxLength={500}
            value={form.descripcion}
            onChange={(event) => updateForm("descripcion", event.target.value)}
          />
          <Input
            label="Unidad"
            required
            maxLength={80}
            value={form.unidad}
            placeholder="unidad, caja, kg..."
            onChange={(event) => updateForm("unidad", event.target.value)}
          />
          <Select
            label="Decimales permitidos en cantidad"
            options={OPCIONES_PRECISION}
            value={String(form.precision_cantidad)}
            onChange={(event) => updateForm("precision_cantidad", Number(event.target.value))}
          />
          {CAMPOS_OPCIONALES.map(([label, field, maxLength]) => (
            <Input
              key={field}
              label={`${label} (opcional)`}
              maxLength={maxLength}
              value={form[field]}
              onChange={(event) => updateForm(field, event.target.value)}
            />
          ))}
          <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
              <Button type="button" variant="ghost" onClick={resetForm} disabled={saving}>
                Cancelar
              </Button>
            <Button
              type="submit"
              loading={saving}
              loadingLabel="Guardando..."
              disabled={saving}
            >
              {editingId ? <Pencil className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              {editingId ? "Guardar cambios" : "Agregar al catálogo"}
            </Button>
          </div>
        </form>
      </Modal>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Referencias del catálogo</CardTitle>
            <CardDescription>
              {products.length} referencias · Las desactivadas se conservan en borradores históricos.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-body">
            <thead className="bg-background text-surface-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Código / referencia</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Unidad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <span role="status" aria-live="polite" className="sr-only">
                      Cargando catálogo...
                    </span>
                    <div className="space-y-3" aria-hidden="true">
                      <Skeleton className="h-4 w-full max-w-xs" />
                      <Skeleton className="h-4 w-full max-w-sm" />
                      <Skeleton className="h-4 w-full max-w-md" />
                      <Skeleton className="h-4 w-full max-w-xs" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-surface-subtle">Aún no hay referencias en el catálogo.</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-background/60">
                  <td className="px-4 py-3">
                    <span className="block font-medium text-surface-foreground">{TIPOS_SERVICIO.find((type) => type.value === product.tipo_servicio)?.label ?? product.tipo_servicio}</span>
                    <span className="text-caption text-surface-subtle">
                      {product.tipo_item === "PRODUCTO" ? "Producto" : "Servicio"}{product.categoria ? ` · ${product.categoria}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-foreground">{[product.codigo, product.referencia].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-surface-foreground">{product.descripcion}</span>
                    <span className="text-caption text-surface-subtle">
                      {[product.metodo, product.presentacion, product.marca].filter(Boolean).join(" · ") || null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-foreground">{product.unidad} · {product.precision_cantidad} dec.</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.activo ? "success" : "neutral"}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => editProduct(product)} disabled={saving}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void toggleActive(product)} disabled={saving}>
                        {product.activo ? <ShieldOff className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                        {product.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
