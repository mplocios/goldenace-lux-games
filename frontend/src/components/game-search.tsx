import { useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/search-modal";

export function GameSearch() {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-gold/30 bg-card/60 px-4 text-sm text-muted-foreground backdrop-blur transition-colors hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        <Search className="h-4 w-4 text-gold" />
        Search games or providers...
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
