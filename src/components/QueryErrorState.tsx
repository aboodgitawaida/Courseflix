type QueryErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function QueryErrorState({
  message = "Could not load this section.",
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
      <p className="text-destructive">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-full border border-brand/40 px-4 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        Try again
      </button>
    </div>
  );
}
