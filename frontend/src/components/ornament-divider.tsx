export function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3 py-2" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-1 rotate-45 bg-gold/50" />
        <div className="h-1.5 w-1.5 rotate-45 bg-gold/80" />
        <div className="h-1 w-1 rotate-45 bg-gold/50" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
}
