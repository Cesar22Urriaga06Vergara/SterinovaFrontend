export type AccionAuditoria =
  | "crear"
  | "editar"
  | "emitir"
  | "publicar"
  | "eliminar"
  | "anular"
  | "login_exitoso"
  | "login_fallido"
  | "aprobar"
  | "rechazar"
  | "cambiar_estado"
  | "resetear_password"
  | "descargar";

export type EventoAuditoria = {
  id: number;
  usuario_id: number | null;
  usuario?: { id: number; nombre: string; email: string } | null;
  entidad: string;
  entidad_id: number | null;
  accion: AccionAuditoria;
  detalle: Record<string, unknown> | null;
  created_at: string;
  scope_id: number | null;
};

export type QueryAuditoriaParams = {
  page?: number;
  limit?: number;
  entidad?: string;
  usuario_id?: number;
  desde?: string;
  hasta?: string;
};
