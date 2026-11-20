"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/lib/api";
import { ivaLabel, quoteAmounts, type IvaVersion } from "@/lib/iva";
import { getApiErrorMessage } from "@/lib/api-errors";
import { notifyToast } from "@/components/ui/states/toast-events";
import type { Cliente } from "@/lib/cliente-types";
import { useSession, useQuoteHeaders } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import { Cotizacion, isEditableDraft, type TipoServicioCotizacion } from "@/lib/cotizacion-types";
import type { ProductoCatalogo } from "@/lib/producto-types";
import { CommercialConditionField, CommercialConditions, createEmptyItem, DraftItem, emptyCommercialConditions } from "./cotizacion-draft.types";
import { appendDraftItem, calculateDraftItems, createCatalogDraftItem } from "./cotizacion-draft.logic";

export function useCotizacionDraft(quoteId?: string) {
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
  const [tipoServicio, setTipoServicio] = useState<TipoServicioCotizacion>("INDUSTRIAL_ETO");
  const [metodo, setMetodo] = useState<'EtO'|'VAPOR'|'NO_APLICA'>('EtO');
  const [alcance, setAlcance] = useState({ aplica_esterilizacion: true, aplica_empaque: false, aplica_transporte: false });
  const [valorTransporte, setValorTransporte] = useState('0');
  const [commercialConditions, setCommercialConditions] = useState<CommercialConditions>(emptyCommercialConditions);
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
    if (!allowed) { router.replace("/comercial/cotizaciones"); return; }
    async function load() {
      try {
        const customers = await api.get<Cliente[]>("/clientes");
        if (!active) return;
        setClientes(customers.data);
        if (quoteId) {
          const { data } = await api.get<Cotizacion>(`/cotizaciones/${quoteId}`, { headers });
          if (!active) return;
          if (!isEditableDraft(data)) { notifyToast("Solo se pueden editar borradores sin emitir.", "error"); router.replace("/comercial/cotizaciones"); return; }
          setVersion(data.version ?? null); setClienteId(String(data.cliente_id)); setTipoServicio(data.tipo_servicio);
          setMetodo(data.metodo_esterilizacion ?? 'NO_APLICA'); setAlcance({aplica_esterilizacion:data.aplica_esterilizacion??false,aplica_empaque:data.aplica_empaque??false,aplica_transporte:data.aplica_transporte??false}); setValorTransporte(String(data.valor_transporte??0));
          setCommercialConditions({ tiempo_despacho: data.tiempo_despacho ?? "", transporte: data.transporte ?? "", forma_pago: data.forma_pago ?? "", validez_oferta: data.validez_oferta ?? "", precio_incluye: data.precio_incluye ?? "", precio_no_incluye: data.precio_no_incluye ?? "" });
          setCondiciones(data.condiciones_comerciales ?? "");
          setItems((data.items ?? []).map((item) => ({ key: crypto.randomUUID(), ...(item.id ? { id: item.id } : {}), ...(item.producto_id ? { producto_id: item.producto_id } : {}), tipo_item: item.tipo_item ?? "SERVICIO", ...(item.categoria ? { categoria: item.categoria } : {}), codigo: item.codigo ?? "", referencia: item.referencia ?? "", metodo: item.metodo ?? "", presentacion: item.presentacion ?? "", marca: item.marca ?? "", descripcion: item.descripcion, unidad: item.unidad ?? "servicio", precision_cantidad: item.precision_cantidad ?? 2, imagen_key: item.imagen_key ?? null, imagen_mime_type: item.imagen_mime_type ?? null, incluir_imagen: Boolean(item.imagen_key), quitar_imagen: false, cantidad: String(item.cantidad), valor_unitario: String(item.valor_unitario) })));
          if (data.iva_tasa != null && data.iva_version_id != null) setTax({ id: data.iva_version_id, version: 0, tasa: data.iva_tasa, vigente_desde: "" });
          else setError("Este borrador histórico no tiene tasa fiscal conciliada. No se puede recalcular.");
        } else {
          const { data } = await api.get<IvaVersion>("/cotizaciones/iva-vigente", { headers });
          if (!active) return; setTax(data);
        }
        setReady(true);
      } catch (loadError) {
        if (!active) return; setError(getApiErrorMessage(loadError));
        if (quoteId && axios.isAxiosError(loadError) && [403, 404].includes(loadError.response?.status ?? 0)) router.replace("/comercial/cotizaciones");
      } finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [headers, quoteId, allowed, router]);

  useEffect(() => {
    const query = catalogQuery.trim(); if (query.length < 2) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setCatalogLoading(true); setCatalogError("");
      const params = new URLSearchParams({ tipo_servicio: tipoServicio, q: query });
      try { const action = quoteId ? "editar" : "crear"; const { data } = await api.get<ProductoCatalogo[]>(`/productos/buscar/${action}?${params.toString()}`, { headers }); if (active) setCatalogResults(data); }
      catch (e) { if (active) { setCatalogResults([]); setCatalogError(getApiErrorMessage(e)); } }
      finally { if (active) setCatalogLoading(false); }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [catalogQuery, headers, quoteId, tipoServicio]);

  async function refreshClientes() {
    if (refreshLock.current) return; refreshLock.current = true; setRefreshing(true); setError("");
    try { const { data } = await api.get<Cliente[]>("/clientes"); setClientes(data); }
    catch (e) { setError(getApiErrorMessage(e)); } finally { refreshLock.current = false; setRefreshing(false); }
  }
  function updateCatalogQuery(value: string) {
    setCatalogQuery(value);
    if (value.trim().length < 2) { setCatalogResults([]); setCatalogLoading(false); setCatalogError(""); }
  }
  const selectedCliente = useMemo(() => clientes.find((c) => String(c.id) === clienteId) ?? null, [clientes, clienteId]);
  const computedItems = useMemo(() => calculateDraftItems(items), [items]);
  const freight = alcance.aplica_transporte ? Number(valorTransporte || 0) : 0;
  const totals = tax ? quoteAmounts(computedItems, tax.tasa, freight) : { subtotal: 0, iva: 0, total: 0 };
  function updateItem(key: string, field: keyof DraftItem, value: unknown) { setItems((prev) => prev.map((item) => item.key === key ? { ...item, [field]: value } as DraftItem : item)); }
  function changeTipoServicio(value: TipoServicioCotizacion) {
    setTipoServicio(value); setCatalogQuery(""); setCatalogResults([]);
    setItems((current) => current.map((item) => { const manualItem = { ...item }; delete manualItem.producto_id; return { ...manualItem, ...(value === "INSUMOS" && item.categoria ? { categoria: item.categoria } : { categoria: undefined }), ...(value === "INSUMOS" ? {} : { imagenFile: undefined, imagen_key: null, imagen_mime_type: null, incluir_imagen: false, quitar_imagen: Boolean(item.imagen_key) }) }; }));
  }
  function addItem() { setItems((prev) => [...prev, createEmptyItem()]); }
  function addCatalogProduct(product: ProductoCatalogo) {
    const newItem = createCatalogDraftItem(product);
    setItems((current) => appendDraftItem(current, newItem)); setCatalogQuery(""); setCatalogResults([]);
  }
  function removeItem(key: string) { setItems((prev) => prev.length === 1 ? prev : prev.filter((item) => item.key !== key)); }
  function updateCommercialCondition(field: CommercialConditionField, value: string) { setCommercialConditions((current) => ({ ...current, [field]: value })); }
  function toggleItemImage(key: string, include: boolean) { setItems((current) => current.map((line) => line.key === key ? { ...line, incluir_imagen: include, quitar_imagen: !include && Boolean(line.imagen_key), imagenFile: include ? line.imagenFile : undefined } : line)); }
  function setItemImage(key: string, file?: File) { setItems((current) => current.map((line) => line.key === key ? { ...line, imagenFile: file, incluir_imagen: Boolean(file || line.imagen_key), quitar_imagen: false } : line)); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitLock.current || !tax || !allowed || !ready || conflict || (quoteId && version == null)) return; setError("");
    if (!clienteId) { setError("Seleccione un cliente."); return; }
    const draftItems = computedItems.filter((item) => item.descripcion.trim());
    if (tipoServicio === "INSUMOS" && draftItems.some((item) => !item.producto_id && !item.categoria)) { setError("Selecciona una categoría para cada ítem manual de Insumos."); return; }
    if (draftItems.some((item) => tipoServicio === "INSUMOS" && item.incluir_imagen && !item.imagen_key && !item.imagenFile)) { setError("Selecciona el archivo de imagen marcado para incluir."); return; }
    if (draftItems.some((item) => !item.unidad.trim())) { setError("Indica la unidad de cada ítem."); return; }
    const payloadItems = draftItems.map((item) => ({ ...(item.producto_id ? { producto_id: item.producto_id, unidad: item.unidad.trim(), precision_cantidad: item.precision_cantidad } : { tipo_item: item.tipo_item, ...(tipoServicio === "INSUMOS" && item.categoria ? { categoria: item.categoria } : {}), codigo: item.codigo, referencia: item.referencia, metodo: item.metodo, presentacion: item.presentacion, marca: item.marca, descripcion: item.descripcion.trim(), unidad: item.unidad.trim(), precision_cantidad: item.precision_cantidad }), ...(quoteId && item.id ? { id: item.id } : {}), cantidad: item.cantidad, valor_unitario: item.valor_unitario }));
    if (!payloadItems.length) { setError("Agregue al menos un ítem con descripción."); return; }
    submitLock.current = true; setSaving(true); let savedQuote: Cotizacion | undefined;
    try {
      const payload = { cliente_id: Number(clienteId), tipo_servicio: tipoServicio, metodo_esterilizacion: metodo, ...alcance, valor_transporte: freight, ...commercialConditions, condiciones_comerciales: condiciones, items: payloadItems };
      if (quoteId) { const { data } = await api.put<Cotizacion>(`/cotizaciones/${quoteId}`, { ...payload, version }, { headers }); savedQuote = data; }
      else { const { data } = await api.post<Cotizacion>("/cotizaciones", { ...payload, iva_version_esperada_id: tax.id }, { headers }); savedQuote = data; }
      if (savedQuote) {
        setVersion(savedQuote.version ?? null);
        for (const [index, item] of draftItems.entries()) {
          const itemId = savedQuote.items?.[index]?.id; if (!itemId) throw new Error("No se recibió el identificador de un ítem guardado.");
          if (tipoServicio === "INSUMOS" && item.incluir_imagen && item.imagenFile) { const formData = new FormData(); formData.append("imagen", item.imagenFile); const { data } = await api.put<{ version: number }>(`/cotizaciones/${savedQuote.id}/items/${itemId}/imagen`, formData, { headers }); setVersion(data.version); }
          else if (tipoServicio === "INSUMOS" && item.quitar_imagen && item.imagen_key) { const { data } = await api.delete<{ version: number }>(`/cotizaciones/${savedQuote.id}/items/${itemId}/imagen`, { headers }); setVersion(data.version); }
        }
      }
      notifyToast("Cotización guardada correctamente.", "success"); router.push("/comercial/cotizaciones");
    } catch (e) {
      if (savedQuote) { notifyToast("La cotización se guardó, pero no se completó el cambio de imágenes. Revisa el borrador e inténtalo de nuevo.", "error"); router.replace(`/comercial/cotizaciones/${savedQuote.id}/editar`); return; }
      setError(getApiErrorMessage(e));
      if (quoteId && axios.isAxiosError(e) && e.response?.status === 409) setConflict(true);
      else if (quoteId && axios.isAxiosError(e) && [403, 404].includes(e.response?.status ?? 0)) router.replace("/comercial/cotizaciones");
      else if (axios.isAxiosError(e) && e.response?.status === 409) { try { const { data } = await api.get<IvaVersion>("/cotizaciones/iva-vigente", { headers }); setTax(data); } catch { setTax(null); } }
    } finally { submitLock.current = false; setSaving(false); }
  }
  return { router, sessionUser, allowed, version, conflict, ready, clientes, tax, clienteId, setClienteId, tipoServicio, changeTipoServicio, metodo, setMetodo, alcance, setAlcance, valorTransporte, setValorTransporte, freight, commercialConditions, condiciones, setCondiciones, items, computedItems, totals, catalogQuery, updateCatalogQuery, catalogResults, catalogLoading, catalogError, loading, saving, refreshing, error, setError, selectedCliente, refreshClientes, updateItem, addItem, addCatalogProduct, removeItem, updateCommercialCondition, toggleItemImage, setItemImage, handleSubmit, ivaLabel };
}
