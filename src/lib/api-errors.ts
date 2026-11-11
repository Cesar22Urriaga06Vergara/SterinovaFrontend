const FALLBACK_API_ERROR =
  "No fue posible completar la solicitud. Inténtalo de nuevo.";

function getErrorText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim())
  ) {
    return value.map((item) => item.trim()).join(" ");
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return FALLBACK_API_ERROR;
  }

  const response = "response" in error ? error.response : undefined;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return FALLBACK_API_ERROR;
  }

  const status =
    "status" in response && typeof response.status === "number"
      ? response.status
      : undefined;
  const data = response.data;
  if (data && typeof data === "object") {
    const message = "message" in data ? getErrorText(data.message) : null;
    if (message) return message;

    const backendError = "error" in data ? getErrorText(data.error) : null;
    if (backendError) return backendError;
  }

  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 401) return "La sesión o las credenciales no son válidas.";
  return FALLBACK_API_ERROR;
}
