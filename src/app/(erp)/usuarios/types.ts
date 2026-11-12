
export type UserRecord = {
  id: number;
  nombre: string;
  apellido: string | null;
  cargo: string | null;
  celular: string | null;
  email_contacto: string | null;
  email: string;
  activo: boolean;
};

export type UserForm = Omit<UserRecord, "id" | "activo" | "apellido" | "cargo" | "celular" | "email_contacto"> & {
  apellido: string;
  cargo: string;
  celular: string;
  email_contacto: string;
  password: string;
  role_id: string;
  scope_id: string;
};


export const blankUserForm = (): UserForm => ({
  nombre: "",
  apellido: "",
  cargo: "",
  celular: "",
  email_contacto: "",
  email: "",
  password: "",
  role_id: "",
  scope_id: "",
});

export function userFullName(user: Pick<UserRecord, "nombre" | "apellido">) {
  return [user.nombre, user.apellido].filter(Boolean).join(" ");
}
