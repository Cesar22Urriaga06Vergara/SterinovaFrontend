"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import axios from "axios";
import { ivaLabel, quoteAmounts, type IvaVersion } from "@/lib/iva";
import { LoadingState } from "@/components/ui/states/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/api-errors";
import { notifyToast } from "@/components/ui/states/toast-events";
import type { Cliente } from "@/lib/cliente-types";
import { useSession, useQuoteHeaders } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import {
  Cotizacion,
  isEditableDraft,
  TIPOS_SERVICIO,
  TipoServicioCotizacion,
  formatCurrency,
} from "@/lib/cotizacion-types";
import type {
  CategoriaProducto,
  ProductoCatalogo,
  TipoItemCatalogo,
} from "@/lib/producto-types";

type DraftItem = {
  key: string;
  id?: number;
  producto_id?: number;
  tipo_item: TipoItemCatalogo;
  categoria?: CategoriaProducto;
  codigo: string;
  referencia: string;
  metodo: string;
  presentacion: string;
  marca: string;
  descripcion: string;
  unidad: string;
  precision_cantidad: number;
  imagen_key?: string | null;
  imagen_mime_type?: string | null;
  imagenFile?: File;
  incluir_imagen: boolean;
  quitar_imagen: boolean;
  cantidad: string;
  valor_unitario: string;
};

const COMMERCIAL_CONDITIONS = [
  ["TIEMPO DE DESPACHO", "tiempo_despacho"],
  ["TRANSPORTE", "transporte"],
  ["FORMA DE PAGO", "forma_pago"],
  ["VALIDEZ DE LA OFERTA", "validez_oferta"],
  ["EL PRECIO INCLUYE", "precio_incluye"],
  ["EL PRECIO NO INCLUYE", "precio_no_incluye"],
] as const;

type CommercialConditionField = (typeof COMMERCIAL_CONDITIONS)[number][1];
type CommercialConditions = Record<CommercialConditionField, string>;

const emptyCommercialConditions = (): CommercialConditions => ({
  tiempo_despacho: "",
  transporte: "",
  forma_pago: "",
  validez_oferta: "",
  precio_incluye: "",
  precio_no_incluye: "",
});

function createEmptyItem(): DraftItem {
  return {
    key: crypto.randomUUID(),
    tipo_item: "SERVICIO",
    codigo: "",
    referencia: "",
    metodo: "",
    presentacion: "",
    marca: "",
    descripcion: "",
    unidad: "servicio",
    precision_cantidad: 0,
    incluir_imagen: false,
    quitar_imagen: false,
    cantidad: "1",
    valor_unitario: "0",
  };
}

export default function CotizacionForm({ quoteId }: { quoteId?: string }) {
  const router = useRouter();
  const sessionUser = useStoredUser();
  const { can } = useSession();
  const headers = useQuoteHeaders();
  const allowed = can(quoteId ? "cotizaciones.editar" : "cotizaciones.crear");
  const [version, setVersion] = useState<number | null>(null);
  const [conflict, setConflict] = useState(false);
  const [ready, setReady] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tax, setTax] = useState<IvaVersion | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [tipoServicio, setTipoServicio] = useState<TipoServicioCotizacion>(
    "INDUSTRIAL_ETO",
  );
  const [commercialConditions, setCommercialConditions] =
    useState<CommercialConditions>(emptyCommercialConditions);
  const [condiciones, setCondiciones] = useState("");
  const [items, setItems] = useState<DraftItem[]>([createEmptyItem()]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<ProductoCatalogo[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);
  const refreshLock = useRef(false);

  useEffect(() => {
    let active = true;
    if (!allowed) {
      router.replace("/comercial/cotizaciones");
      return;
    }
    async function load() {
      try {
        const customers = await api.get<Cliente[]>("/clientes");
        if (!active) return;
        setClientes(customers.data);
        if (quoteId) {
          const { data } = await api.get<Cotizacion>(`/cotizaciones/${quoteId}`, { headers });
          if (!active) return;
          if (!isEditableDraft(data)) {
            notifyToast("Solo se pueden editar borradores sin emitir.", "error");
            router.replace("/comercial/cotizaciones");
            return;
          }
          setVersion(data.version ?? null);
          setClienteId(String(data.cliente_id));
          setTipoServicio(data.tipo_servicio);
          setCommercialConditions({
            tiempo_despacho: data.tiempo_despacho ?? "",
            transporte: data.transporte ?? "",
            forma_pago: data.forma_pago ?? "",
            validez_oferta: data.validez_oferta ?? "",
            precio_incluye: data.precio_incluye ?? "",
            precio_no_incluye: data.precio_no_incluye ?? "",
          });
          setCondiciones(data.condiciones_comerciales ?? "");
          setItems((data.items ?? []).map((item) => ({
            key: crypto.randomUUID(),
            ...(item.id ? { id: item.id } : {}),
            ...(item.producto_id ? { producto_id: item.producto_id } : {}),
            tipo_item: item.tipo_item ?? "SERVICIO",
            ...(item.categoria ? { categoria: item.categoria } : {}),
            codigo: item.codigo ?? "",
            referencia: item.referencia ?? "",
            metodo: item.metodo ?? "",
            presentacion: item.presentacion ?? "",
            marca: item.marca ?? "",
            descripcion: item.descripcion,
            unidad: item.unidad ?? "servicio",
            precision_cantidad: item.precision_cantidad ?? 2,
            imagen_key: item.imagen_key ?? null,
            imagen_mime_type: item.imagen_mime_type ?? null,
            incluir_imagen: Boolean(item.imagen_key),
            quitar_imagen: false,
            cantidad: String(item.cantidad),
            valor_unitario: String(item.valor_unitario),
          })));
          if (data.iva_tasa != null && data.iva_version_id != null) {
            setTax({id: data.iva_version_id, version: 0, tasa: data.iva_tasa, vigente_desde: ""});
          } else {
            setError("Este borrador hist\u00f3rico no tiene tasa fiscal conciliada. No se puede recalcular.");
          }
        } else {
          const { data } = await api.get<IvaVersion>("/cotizaciones/iva-vigente", { headers });
          if (!active) return;
          setTax(data);
        }
        setReady(true);
      } catch (loadError) {
        if (!active) return;
        setError(getApiErrorMessage(loadError));
        if (quoteId && axios.isAxiosError(loadError) && [403, 404].includes(loadError.response?.status ?? 0))
          router.replace("/comercial/cotizaciones");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [headers, quoteId, allowed, router]);

  useEffect(() => {
    const query = catalogQuery.trim();
    if (query.length < 2) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      setCatalogLoading(true);
      setCatalogError("");
      const params = new URLSearchParams({
        tipo_servicio: tipoServicio,
        q: query,
      });
      try {
        const action = quoteId ? "editar" : "crear";
        const { data } = await api.get<ProductoCatalogo[]>(
          `/productos/buscar/${action}?${params.toString()}`,
          { headers },
        );
        if (active) setCatalogResults(data);
      } catch (searchError) {
        if (active) {
          setCatalogResults([]);
          setCatalogError(getApiErrorMessage(searchError));
        }
      } finally {
        if (active) setCatalogLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [catalogQuery, headers, quoteId, tipoServicio]);

  async function refreshClientes() {
    if (refreshLock.current) return;
    refreshLock.current = true;
    setRefreshing(true);
    setError("");
    try {
      const { data } = await api.get<Cliente[]>("/clientes");
      setClientes(data);
    } catch (refreshError) {
      setError(getApiErrorMessage(refreshError));
    } finally {
      refreshLock.current = false;
      setRefreshing(false);
    }
  }

  const selectedCliente = useMemo(
    () => clientes.find((c) => String(c.id) === clienteId) ?? null,
    [clientes, clienteId],
  );

  const computedItems = useMemo(
    () =>
      items.map((item) => {
        const cantidad = Number(item.cantidad) || 0;
        const valor_unitario = Number(item.valor_unitario) || 0;
        return {
          ...item,
          cantidad,
          valor_unitario,
          valor_total: Number((cantidad * valor_unitario).toFixed(2)),
        };
      }),
    [items],
  );

  const { subtotal, iva, total } = tax
    ? quoteAmounts(computedItems, tax.tasa)
    : { subtotal: 0, iva: 0, total: 0 };

  function updateItem<K extends keyof DraftItem>(
    key: string,
    field: K,
    value: DraftItem[K],
  ) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function changeTipoServicio(value: TipoServicioCotizacion) {
    setTipoServicio(value);
    setCatalogQuery("");
    setCatalogResults([]);
    setItems((current) =>
      current.map((item) => {
        const manualItem = { ...item };
        delete manualItem.producto_id;
        return {
          ...manualItem,
          ...(value === "INSUMOS" && item.categoria
            ? { categoria: item.categoria }
            : { categoria: undefined }),
          ...(value === "INSUMOS"
            ? {}
            : {
                imagenFile: undefined,
                imagen_key: null,
                imagen_mime_type: null,
                incluir_imagen: false,
                quitar_imagen: Boolean(item.imagen_key),
              }),
        };
      }),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function addCatalogProduct(product: ProductoCatalogo) {
    const newItem: DraftItem = {
      key: crypto.randomUUID(),
      producto_id: product.id,
      tipo_item: product.tipo_item,
      ...(product.categoria ? { categoria: product.categoria } : {}),
      codigo: product.codigo ?? "",
      referencia: product.referencia ?? "",
      metodo: product.metodo ?? "",
      presentacion: product.presentacion ?? "",
      marca: product.marca ?? "",
      descripcion: product.descripcion,
      unidad: product.unidad,
      precision_cantidad: product.precision_cantidad,
      incluir_imagen: false,
      quitar_imagen: false,
      cantidad: "1",
      valor_unitario: "0",
    };
    setItems((current) =>
      current.length === 1 && !current[0]?.descripcion.trim()
        ? [newItem]
        : [...current, newItem],
    );
    setCatalogQuery("");
    setCatalogResults([]);
  }

  function removeItem(key: string) {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.key !== key),
    );
  }

  function updateCommercialCondition(
    field: CommercialConditionField,
    value: string,
  ) {
    setCommercialConditions((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || !tax || !allowed || !ready || conflict || (quoteId && version == null)) return;
    setError("");

    if (!clienteId) {
      setError("Seleccione un cliente.");
      return;
    }

    const draftItems = computedItems.filter((item) => item.descripcion.trim());
    const missingImage = draftItems.find(
      (item) =>
        tipoServicio === "INSUMOS" &&
        item.incluir_imagen &&
        !item.imagen_key &&
        !item.imagenFile,
    );
    if (missingImage) {
      setError("Selecciona el archivo de imagen marcado para incluir.");
      return;
    }

    const payloadItems = draftItems
      .map((item) => ({
        ...(item.producto_id ? { producto_id: item.producto_id } : {
          tipo_item: item.tipo_item,
          ...(tipoServicio === "INSUMOS" && item.categoria
            ? { categoria: item.categoria }
            : {}),
          codigo: item.codigo,
          referencia: item.referencia,
          metodo: item.metodo,
          presentacion: item.presentacion,
          marca: item.marca,
          descripcion: item.descripcion.trim(),
          unidad: item.unidad.trim(),
          precision_cantidad: item.precision_cantidad,
        }),
        ...(quoteId && item.id ? { id: item.id } : {}),
        cantidad: item.cantidad,
        valor_unitario: item.valor_unitario,
      }));

    if (!payloadItems.length) {
      setError("Agregue al menos un ítem con descripción.");
      return;
    }

    submitLock.current = true;
    setSaving(true);
    let savedQuote: Cotizacion | undefined;
    try {
      const payload = {
        cliente_id: Number(clienteId),
        tipo_servicio: tipoServicio,
        ...commercialConditions,
        condiciones_comerciales: condiciones,
        items: payloadItems,
      };
      if (quoteId) {
        const { data } = await api.put<Cotizacion>(`/cotizaciones/${quoteId}`, { ...payload, version }, { headers });
        savedQuote = data;
      } else {
        const { data } = await api.post<Cotizacion>("/cotizaciones", { ...payload, iva_version_esperada_id: tax.id }, { headers });
        savedQuote = data;
      }
      if (savedQuote) {
        setVersion(savedQuote.version ?? null);
        for (const [index, item] of draftItems.entries()) {
          const itemId = savedQuote.items?.[index]?.id;
          if (!itemId) throw new Error("No se recibió el identificador de un ítem guardado.");
          if (tipoServicio === "INSUMOS" && item.incluir_imagen && item.imagenFile) {
            const formData = new FormData();
            formData.append("imagen", item.imagenFile);
            const { data } = await api.put<{ version: number }>(
              `/cotizaciones/${savedQuote.id}/items/${itemId}/imagen`,
              formData,
              { headers },
            );
            setVersion(data.version);
          } else if (tipoServicio === "INSUMOS" && item.quitar_imagen && item.imagen_key) {
            const { data } = await api.delete<{ version: number }>(
              `/cotizaciones/${savedQuote.id}/items/${itemId}/imagen`,
              { headers },
            );
            setVersion(data.version);
          }
        }
      }
      notifyToast("Cotización guardada correctamente.", "success");
      router.push("/comercial/cotizaciones");
    } catch (saveError) {
      if (savedQuote) {
        notifyToast(
          "La cotización se guardó, pero no se completó el cambio de imágenes. Revisa el borrador e inténtalo de nuevo.",
          "error",
        );
        router.replace(`/comercial/cotizaciones/${savedQuote.id}/editar`);
        return;
      }
      setError(getApiErrorMessage(saveError));
      if (quoteId && axios.isAxiosError(saveError) && saveError.response?.status === 409) {
        setConflict(true);
      } else if (quoteId && axios.isAxiosError(saveError) && [403, 404].includes(saveError.response?.status ?? 0)) {
        router.replace("/comercial/cotizaciones");
      } else if (axios.isAxiosError(saveError) && saveError.response?.status === 409) {
        try {
          const { data } = await api.get<IvaVersion>("/cotizaciones/iva-vigente", { headers });
          setTax(data);
        } catch { setTax(null); }
      }
    } finally {
      submitLock.current = false;
      setSaving(false);
    }
  }

  if (!allowed || (quoteId && !ready && !error) || loading) {
    return <LoadingState label="Cargando formulario de cotización..." />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title={quoteId ? "Editar Cotización" : "Nueva Cotización"}
        description="Formato comercial Sterinova — 7 tipos de servicio."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {!quoteId && <p role="status" className="rounded-lg border border-secondary/30 bg-secondary-light px-4 py-3 text-sm text-surface-foreground">
          Responsable de esta cotización: <strong>{[sessionUser?.nombre, sessionUser?.apellido].filter(Boolean).join(" ") || sessionUser?.email || "Usuario autenticado"}</strong>
          {sessionUser?.cargo ? ` · ${sessionUser.cargo}` : ""}. El sistema la asociará automáticamente a esta cuenta.
        </p>}
        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <h2 className="text-lg font-semibold text-surface-foreground">
            1. Cliente
          </h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-surface-foreground">
              Seleccionar cliente
            </span>
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              <option value="">Seleccione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razon_social}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {clientes.length === 0 ? (
              <span className="text-surface-subtle">
                No hay clientes disponibles.
              </span>
            ) : (
              <span className="text-surface-subtle">
                ¿No encuentra al cliente?
              </span>
            )}
            <Link
              href="/comercial/clientes"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-secondary underline"
            >
              Gestionar clientes
            </Link>
            <button
              type="button"
              onClick={() => void refreshClientes()}
              disabled={refreshing}
              aria-busy={refreshing}
              className="font-semibold text-secondary underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Actualizando..." : "Actualizar lista"}
            </button>
          </div>

          {selectedCliente ? (
            <div className="mt-4 grid gap-2 rounded-lg bg-background p-4 text-sm text-surface-foreground sm:grid-cols-2">
              <p>
                <span className="font-semibold">NIT:</span> {selectedCliente.nit}
              </p>
              <p>
                <span className="font-semibold">Contacto:</span>{" "}
                {selectedCliente.contacto}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span>{" "}
                {selectedCliente.telefono}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedCliente.email}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Dirección:</span>{" "}
                {selectedCliente.direccion}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <h2 className="text-lg font-semibold text-surface-foreground">
            2. Configuración
          </h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-surface-foreground">
              Tipo de cotización
            </span>
            <select
              value={tipoServicio}
              onChange={(e) =>
                changeTipoServicio(e.target.value as TipoServicioCotizacion)
              }
              className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              {TIPOS_SERVICIO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label} · {tipo.prefix}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <h2 className="text-lg font-semibold text-surface-foreground">
            3. Condiciones comerciales
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Puedes guardar el borrador y completar estos datos antes de solicitar aprobación.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {COMMERCIAL_CONDITIONS.map(([label, field]) => (
              <label key={field} className="block text-sm">
                <span className="mb-1 block font-medium text-surface-foreground">
                  {label}
                </span>
                <textarea
                  rows={3}
                  value={commercialConditions[field]}
                  onChange={(event) =>
                    updateCommercialCondition(field, event.target.value)
                  }
                  className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                />
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-surface-foreground">
              Notas comerciales adicionales (opcional)
            </span>
            <textarea
              rows={3}
              value={condiciones}
              onChange={(event) => setCondiciones(event.target.value)}
              className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </label>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-surface-foreground">
              4. Detalle de ítems
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-secondary hover:bg-secondary-hover/10"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Añadir ítem manual
            </button>
          </div>

          <div className="mt-4">
            <label htmlFor="catalog-search" className="mb-1 block text-sm font-medium text-surface-foreground">
              Buscar en el catálogo de {TIPOS_SERVICIO.find((type) => type.value === tipoServicio)?.label}
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" aria-hidden />
                <input
                  id="catalog-search"
                  type="search"
                  value={catalogQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCatalogQuery(value);
                    if (value.trim().length < 2) {
                      setCatalogResults([]);
                      setCatalogLoading(false);
                      setCatalogError("");
                    }
                  }}
                  placeholder="Descripción, código, referencia o método"
                  className="w-full rounded-lg border border-surface-border bg-background py-2 pl-9 pr-3 text-surface-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              {catalogLoading ? <span role="status" className="self-center text-sm text-secondary">Buscando...</span> : null}
            </div>
            {catalogError ? <p role="alert" className="mt-2 text-sm text-error">{catalogError}</p> : null}
            {catalogQuery.trim().length > 0 && catalogQuery.trim().length < 2 ? (
              <p className="mt-2 text-xs text-surface-subtle">Escribe al menos 2 caracteres.</p>
            ) : null}
            {catalogResults.length > 0 ? (
              <ul aria-label="Resultados del catálogo" className="mt-2 max-h-64 divide-y overflow-y-auto rounded-lg border border-surface-border">
                {catalogResults.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => addCatalogProduct(product)}
                      className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-background"
                    >
                      <span>
                        <span className="block font-medium text-surface-foreground">{product.descripcion}</span>
                        <span className="text-xs text-surface-subtle">
                          {[product.codigo, product.referencia, product.metodo, product.presentacion, product.marca, product.categoria]
                            .filter(Boolean)
                            .join(" · ") || product.unidad}
                        </span>
                      </span>
                      <span className="font-semibold text-secondary">Agregar</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : catalogQuery.trim().length >= 2 && !catalogLoading && !catalogError ? (
              <p className="mt-2 text-sm text-surface-subtle">No hay referencias activas para este tipo de cotización.</p>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-background text-surface-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Descripción y unidad</th>
                  <th className="px-3 py-2 font-semibold">Cantidad</th>
                  <th className="px-3 py-2 font-semibold">Valor unitario</th>
                  <th className="px-3 py-2 font-semibold">Valor total</th>
                  <th className="px-3 py-2 font-semibold"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {computedItems.map((item) => (
                  <tr key={item.key} className="border-t border-surface-border">
                    <td className="min-w-[280px] px-3 py-2">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-secondary">
                          {item.producto_id ? "Catálogo" : "Manual"} · {item.tipo_item === "PRODUCTO" ? "Producto" : "Servicio"}
                        </span>
                        {item.categoria ? <span className="text-xs text-surface-subtle">{item.categoria}</span> : null}
                      </div>
                      <input
                        required={!item.producto_id}
                        readOnly={Boolean(item.producto_id)}
                        value={item.descripcion}
                        onChange={(event) =>
                          updateItem(item.key, "descripcion", event.target.value)
                        }
                        className="w-full rounded-lg border border-surface-border bg-background px-2 py-1.5 read-only:bg-background"
                        placeholder="Descripción del producto o servicio"
                      />
                      {item.producto_id ? (
                        <p className="mt-1 text-xs text-surface-subtle">
                          {[item.codigo, item.referencia, item.metodo, item.presentacion, item.marca]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer font-medium text-secondary">Datos de la línea manual</summary>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1 block">Tipo</span>
                              <select
                                value={item.tipo_item}
                                onChange={(event) => updateItem(item.key, "tipo_item", event.target.value as TipoItemCatalogo)}
                                className="w-full rounded border bg-surface px-2 py-1.5"
                              >
                                <option value="PRODUCTO">Producto</option>
                                <option value="SERVICIO">Servicio</option>
                              </select>
                            </label>
                            <label className="block">
                              <span className="mb-1 block">Decimales permitidos</span>
                              <select value={item.precision_cantidad}
                                onChange={(event) => updateItem(item.key, "precision_cantidad", Number(event.target.value))}
                                className="w-full rounded border bg-surface px-2 py-1.5">
                                <option value={0}>0 (unidades enteras)</option>
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
                              <label key={field} className="block">
                                <span className="mb-1 block">{label}</span>
                                <input maxLength={maxLength} value={item[field]}
                                  onChange={(event) => updateItem(item.key, field, event.target.value)}
                                  className="w-full rounded border bg-surface px-2 py-1.5" />
                              </label>
                            ))}
                          </div>
                        </details>
                      )}
                      {!item.producto_id ? (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <label className="block text-xs">
                            <span className="mb-1 block font-medium">Unidad</span>
                            <input required maxLength={80} value={item.unidad}
                              onChange={(event) => updateItem(item.key, "unidad", event.target.value)}
                              className="w-full rounded border bg-surface px-2 py-1.5 text-sm" />
                          </label>
                          {tipoServicio === "INSUMOS" ? (
                            <label className="block text-xs">
                              <span className="mb-1 block font-medium">Categoría</span>
                              <select
                                required
                                value={item.categoria ?? ""}
                                onChange={(event) => updateItem(item.key, "categoria", event.target.value as CategoriaProducto)}
                                className="w-full rounded border bg-surface px-2 py-1.5 text-sm"
                              >
                                <option value="">Seleccione...</option>
                                <option value="EMPAQUES">Empaques</option>
                                <option value="MONITOREO">Monitoreo</option>
                                <option value="EQUIPOS">Equipos</option>
                              </select>
                            </label>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-surface-subtle">Unidad: {item.unidad || "—"}</p>
                      )}
                      {tipoServicio === "INSUMOS" ? (
                        <div className="mt-2">
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-surface-foreground">
                            <input
                              type="checkbox"
                              checked={item.incluir_imagen}
                              onChange={(event) => {
                                const incluir = event.target.checked;
                                setItems((current) =>
                                  current.map((line) =>
                                    line.key === item.key
                                      ? {
                                          ...line,
                                          incluir_imagen: incluir,
                                          quitar_imagen:
                                            !incluir && Boolean(line.imagen_key),
                                          imagenFile: incluir
                                            ? line.imagenFile
                                            : undefined,
                                        }
                                      : line,
                                  ),
                                );
                              }}
                            />
                            Incluir imagen en el formato
                          </label>
                          {item.incluir_imagen ? (
                            <div className="mt-1">
                              <input
                                type="file"
                                accept="image/png,image/jpeg"
                                required={!item.imagen_key && !item.imagenFile}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file && file.size > 5 * 1024 * 1024) {
                                    setError("La imagen no puede superar 5 MB.");
                                    event.target.value = "";
                                    return;
                                  }
                                  setError("");
                                  setItems((current) =>
                                    current.map((line) =>
                                      line.key === item.key
                                        ? {
                                            ...line,
                                            imagenFile: file,
                                            incluir_imagen: Boolean(file || line.imagen_key),
                                            quitar_imagen: false,
                                          }
                                        : line,
                                    ),
                                  );
                                }}
                                className="mt-1 block max-w-full text-xs"
                              />
                              <p role="status" className="mt-1 text-xs text-surface-subtle">
                                {item.imagenFile?.name ??
                                  (item.imagen_key
                                    ? "Imagen guardada"
                                    : "PNG o JPG, máximo 5 MB")}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        required
                        type="number"
                        min={item.precision_cantidad === 0 ? "1" : item.precision_cantidad === 1 ? "0.1" : "0.01"}
                        step={10 ** -item.precision_cantidad}
                        value={item.cantidad}
                        onChange={(e) =>
                          updateItem(item.key, "cantidad", e.target.value)
                        }
                        className="w-28 rounded-lg border border-surface-border bg-background px-2 py-1.5 disabled:opacity-70"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.valor_unitario}
                        onChange={(e) =>
                          updateItem(item.key, "valor_unitario", e.target.value)
                        }
                        className="w-36 rounded-lg border border-surface-border bg-background px-2 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-surface-foreground">
                      {formatCurrency(item.valor_total)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded-lg p-2 text-error hover:bg-red-50"
                        aria-label="Eliminar ítem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-surface-border">
          <h2 className="text-lg font-semibold text-surface-foreground">
            5. Totales
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-surface-foreground">
              <dt>Subtotal</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-surface-foreground">
              <dt>{tax ? ivaLabel(tax.tasa) : "IVA no disponible"}</dt>
              <dd className="font-medium">{formatCurrency(iva)}</dd>
            </div>
            <div className="flex justify-between border-t border-surface-border pt-2 text-base font-bold text-primary">
              <dt>Total General</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
        </section>

        {error ? (
          <p className="text-sm font-medium text-error" role="alert">
            {error}
          </p>
        ) : null}

        {conflict && <p role="status">Tus cambios siguen en el formulario. Recarga la página para obtener la versión actual antes de guardar.</p>}
        <section className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/comercial/cotizaciones")}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !tax || !ready || conflict || (Boolean(quoteId) && version == null) || clientes.length === 0}
            aria-busy={saving}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                Guardando...
              </span>
            ) : (
              "Guardar Cotización"
            )}
          </button>
        </section>
      </form>
    </div>
  );
}
