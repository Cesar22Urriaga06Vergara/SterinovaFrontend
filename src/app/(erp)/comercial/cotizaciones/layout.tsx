"use client";

import { useSession } from "@/lib/session";

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  const { current_scope, available_scopes, selectScope } = useSession();
  return <>
    <label className="mb-4 block text-sm">Ámbito actual
      <select className="ml-2 rounded border bg-white p-2" value={current_scope?.id ?? ""}
        onChange={event => selectScope(Number(event.target.value))}>
        <option value="" disabled>Selecciona un ámbito</option>
        {available_scopes.map(scope => <option key={scope.id} value={scope.id}>{scope.name}</option>)}
      </select>
    </label>
    {current_scope ? children : <p>Selecciona un ?mbito para continuar.</p>}
  </>;
}
