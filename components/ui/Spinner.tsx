export function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}
