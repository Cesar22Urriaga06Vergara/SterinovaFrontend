export type StoredUser = {
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  cargo?: string;
  celular?: string;
  email_contacto?: string;
};

export function parseStoredUser(value: string | null): StoredUser | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    return {
      id: typeof record.id === "number" ? record.id : undefined,
      nombre: typeof record.nombre === "string" ? record.nombre : undefined,
      apellido: typeof record.apellido === "string" ? record.apellido : undefined,
      email: typeof record.email === "string" ? record.email : undefined,
      rol: typeof record.rol === "string" ? record.rol : undefined,
      cargo: typeof record.cargo === "string" ? record.cargo : undefined,
      celular: typeof record.celular === "string" ? record.celular : undefined,
      email_contacto: typeof record.email_contacto === "string" ? record.email_contacto : undefined,
    };
  } catch {
    return null;
  }
}
