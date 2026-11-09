import type {
  MaterialRecibido,
  EvaluacionParametro,
  ProtocoloVersion,
} from "./operational-types";

export function nuevoMaterial(): MaterialRecibido {
  return {
    descripcion: "",
    referencia: null,
    lote: null,
    cantidad: 1,
    empaque: null,
    muestras_retencion: null,
    muestras_cliente: null,
    muestras_laboratorio: null,
  };
}
export function validarMateriales(materiales: MaterialRecibido[]) {
  if (!materiales.length) return "Añade al menos un material recibido.";
  for (const m of materiales) {
    if (
      !m.descripcion.trim() ||
      !Number.isInteger(m.cantidad) ||
      m.cantidad < 1 ||
      m.cantidad > 4294967295
    )
      return "Cada material requiere descripción y cantidad entera positiva.";
    for (const value of [
      m.muestras_retencion,
      m.muestras_cliente,
      m.muestras_laboratorio,
    ]) {
      if (
        value !== null &&
        (!Number.isInteger(value) || value < 0 || value > 4294967295)
      )
        return "Las muestras deben ser enteros no negativos o N/A.";
    }
  }
  return "";
}
export function evaluacionesParaAprobar(
  protocolo: ProtocoloVersion | undefined,
  selecciones: Record<string, { criterio: string; opcion: string }>,
): EvaluacionParametro[] | null {
  if (!protocolo) return null;
  const rows = protocolo.especificaciones_json.filas.filter((f) => f.aplicable);
  if (!rows.length) return null;
  const result: EvaluacionParametro[] = [];
  for (const row of rows) {
    const selection = selecciones[row.parametro];
    if (
      !selection ||
      selection.criterio !== "CUMPLE" ||
      selection.opcion === "" ||
      !row.opciones[Number(selection.opcion)]
    )
      return null;
    result.push({
      parametro: row.parametro,
      criterio: "CUMPLE",
      opcion: Number(selection.opcion),
    });
  }
  return result;
}
