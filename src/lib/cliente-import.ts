export type ClienteImportacion = {
  razon_social: string;
  nit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
}

function getExcelValue(row: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  const value = Object.entries(row).find(([header]) =>
    normalizedAliases.includes(normalizeHeader(header)),
  )?.[1];
  return value === undefined || value === null ? "" : String(value).trim();
}

export function mapClienteExcelRow(
  row: Record<string, unknown>,
): ClienteImportacion {
  return {
    razon_social: getExcelValue(row, ["razon_social", "razon social", "cliente"]),
    nit: getExcelValue(row, ["nit", "id"]),
    contacto: getExcelValue(row, ["contacto"]) || "No registra",
    telefono: getExcelValue(row, ["telefono", "teléfono"]) || "No registra",
    email: getExcelValue(row, ["email", "correo"]),
    direccion: getExcelValue(row, ["direccion", "dirección"]) || "No registra",
  };
}
