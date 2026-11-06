export function getRejectReasonError(reason: string): string {
  const normalizedReason = reason.trim();
  if (!normalizedReason) return "El motivo del rechazo es obligatorio.";
  if (normalizedReason.length > 2000) {
    return "El motivo no puede superar los 2000 caracteres.";
  }
  return "";
}
