export type TasaFiscalVersion = {
  id: number;
  version: number;
  tasa: string;
  vigente_desde: string;
  motivo?: string;
  creado_por?: number | null;
  creado_at?: string;
};

export type PublicarTasaDto = {
  tasa: string;
  vigente_desde: string;
  motivo: string;
};
