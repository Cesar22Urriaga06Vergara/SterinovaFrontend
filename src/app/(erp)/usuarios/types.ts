export type UserRole = "Admin" | "Comercial" | "Logistica" | "Planta" | "Calidad";

export type UserRecord = {
  id: number;
  nombre: string;
  apellido: string | null;
  cargo: string | null;
  celular: string | null;
  email_contacto: string | null;
  email: string;
  rol: UserRole;
  activo: boolean;
};

export type UserForm = Omit<UserRecord, "id" | "activo" | "apellido" | "cargo" | "celular" | "email_contacto"> & {
  apellido: string;
  cargo: string;
  celular: string;
  email_contacto: string;
  password: string;
};

export const USER_ROLES: UserRole[] = ["Admin", "Comercial", "Logistica", "Planta", "Calidad"];

export const blankUserForm = (): UserForm => ({
  nombre: "",
  apellido: "",
  cargo: "",
  celular: "",
  email_contacto: "",
  email: "",
  rol: "Comercial",
  password: "",
});

export function userFullName(user: Pick<UserRecord, "nombre" | "apellido">) {
  return [user.nombre, user.apellido].filter(Boolean).join(" ");
}
