export type RolesAmbitosScope = { id: number; code: string; name: string; kind: string };

export function buildRolesAmbitosViewModel(
  scopes: readonly RolesAmbitosScope[],
  canManageScopes: boolean,
) {
  const operationalScopeCount = scopes.filter((scope) => scope.kind !== "GLOBAL").length;
  return {
    scopeCount: scopes.length,
    scopeOptions: scopes.map((scope) => ({
      value: String(scope.id),
      label: `${scope.name} (${scope.kind})`,
    })),
    parentScopeOptions: scopes.length > 0
      ? scopes.map((scope) => ({
          value: String(scope.id),
          label: `${scope.name} (${scope.kind})`,
        }))
      : [{ value: "1", label: "Global (raíz)" }],
    showCreateScope: canManageScopes,
    createScopeLabel: operationalScopeCount === 0
      ? "Crear primer ámbito operativo"
      : "Crear ámbito",
  };
}
