import type { Cliente } from "./cliente-types";

export type ClienteFormData = Pick<Cliente, "razon_social" | "nit" | "contacto" | "telefono" | "email" | "direccion"> & { cargo: string; ciudad: string };

export const emptyClienteForm = (): ClienteFormData => ({ razon_social: "", nit: "", cargo: "", ciudad: "", contacto: "", telefono: "", email: "", direccion: "" });

export function clienteToForm(cliente: Cliente): ClienteFormData {
  return { razon_social: cliente.razon_social, nit: cliente.nit, cargo: cliente.cargo ?? "", ciudad: cliente.ciudad ?? "", contacto: cliente.contacto, telefono: cliente.telefono, email: cliente.email, direccion: cliente.direccion };
}

export function clienteFormPayload(form: ClienteFormData): ClienteFormData {
  return { ...form, razon_social: form.razon_social.trim(), nit: form.nit.trim(), cargo: form.cargo.trim(), ciudad: form.ciudad.trim(), contacto: form.contacto.trim(), telefono: form.telefono.trim(), email: form.email.trim(), direccion: form.direccion.trim() };
}
