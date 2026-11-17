import axios from "axios";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(value: string): Date {
  // Las fechas sin hora se interpretan como fecha civil local. `new Date("YYYY-MM-DD")`
  // las trata como UTC y en zonas como America/Bogota muestra el día anterior.
  return new Date(DATE_ONLY_PATTERN.test(value) ? `${value}T12:00:00` : value);
}

export function formatDate(value: string): string {
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-CO");
}

type DateTimeStyle = "medium" | "long";

export function formatDateTime(
  value: string,
  options: { dateStyle?: DateTimeStyle; invalidText?: string } = {},
): string {
  const { dateStyle = "medium", invalidText } = options;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return invalidText ?? value;
  return date.toLocaleString("es-CO", { dateStyle, timeStyle: "short" });
}

export function getAxiosErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error && "response" in error) {
    const response = axios.isAxiosError(error)
      ? error.response
      : (error as { response?: { data?: { message?: unknown } } }).response;
    const message: unknown = response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}
