type TableStateProps = {
  colSpan: number;
  message: string;
  loading?: boolean;
  mode?: "row" | "panel";
};

export function TableState({
  colSpan,
  message,
  loading = false,
  mode = "row",
}: TableStateProps) {
  if (mode === "panel") {
    return (
      <section
        role="status"
        aria-live={loading ? "polite" : undefined}
        className="rounded-card border border-surface-border bg-surface px-5 py-6 text-sm text-surface-subtle"
      >
        {message}
      </section>
    );
  }

  return (
    <tr>
      <td
        colSpan={colSpan}
        role="status"
        aria-live={loading ? "polite" : undefined}
        className="px-4 py-10 text-center text-surface-subtle"
      >
        {message}
      </td>
    </tr>
  );
}
