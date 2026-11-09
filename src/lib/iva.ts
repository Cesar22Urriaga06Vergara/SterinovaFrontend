export type IvaVersion = { id: number; version: number; tasa: string; vigente_desde: string };

const round = (value: number) => Number(value.toFixed(2));

export function quoteAmounts(items: { cantidad: number; valor_unitario: number }[], tasa: string) {
  const subtotal = round(items.reduce((sum, item) => sum + round(item.cantidad * item.valor_unitario), 0));
  const [whole, fraction = ''] = tasa.split('.');
  const scaledRate = BigInt(whole + fraction.padEnd(6, '0'));
  const product = BigInt(subtotal.toFixed(2).replace('.', '')) * scaledRate;
  const half = product < BigInt(0) ? -BigInt(500000) : BigInt(500000);
  const iva = Number((product + half) / BigInt(1000000)) / 100;
  return { subtotal, iva, total: round(subtotal + iva) };
}

export function ivaLabel(tasa: string | number | null | undefined) {
  // Absent metadata identifies the historical renderer contract; do not reinterpret old snapshots.
  if (tasa === undefined) return 'IVA (19%)';
  if (tasa === null) return 'IVA';
  return `IVA (${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(Number(tasa) * 100)}%)`;
}
