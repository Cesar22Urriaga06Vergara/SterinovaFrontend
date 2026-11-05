export type Cliente = {
  id: number;
  razon_social: string;
  nit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  cargo?: string | null;
  ciudad?: string | null;
};

export type ClienteDatosDocumento = Cliente;
