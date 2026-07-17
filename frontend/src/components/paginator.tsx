import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  size?: "sm" | "default";
}

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (current <= 3) {
    pages.push(2, 3);
    if (current === 3 && total > 4) pages.push(4);
    pages.push("ellipsis", total);
  } else if (current >= total - 2) {
    pages.push("ellipsis");
    if (current === total - 2 && total > 4) pages.push(total - 3);
    pages.push(total - 2, total - 1, total);
  } else {
    pages.push("ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }

  return pages;
}

export function Paginator({ page, totalPages, onPageChange, total, size = "default" }: PaginatorProps) {
  if (totalPages <= 1) return null;

  const isSmall = size === "sm";
  const btnH = isSmall ? "h-7 w-7" : "h-8 w-8";
  const btnText = isSmall ? "h-7 min-w-[1.75rem] px-1.5" : "h-8 min-w-[2rem] px-2";
  const iconSize = isSmall ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = isSmall ? "text-[11px]" : "text-xs";

  const visible = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className={`${textSize} text-muted-foreground`}>
        Page {page} of {totalPages}{total != null ? ` (${total.toLocaleString()} total)` : ""}
      </p>
      <div className="flex items-center gap-1">
        {totalPages > 5 && (
          <Button
            size="sm" variant="outline" disabled={page === 1}
            onClick={() => onPageChange(1)}
            className={`${btnH} p-0`}
            title="First page"
          >
            <ChevronsLeft className={iconSize} />
          </Button>
        )}
        <Button
          size="sm" variant="outline" disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${btnH} p-0`}
        >
          <ChevronLeft className={iconSize} />
        </Button>

        {visible.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e${i}`} className={`${btnText} flex items-center justify-center text-muted-foreground`}>…</span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange(p)}
              className={`${btnText} ${textSize} ${p === page ? "bg-gold-gradient text-primary-foreground hover:opacity-90" : ""}`}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          size="sm" variant="outline" disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${btnH} p-0`}
        >
          <ChevronRight className={iconSize} />
        </Button>
        {totalPages > 5 && (
          <Button
            size="sm" variant="outline" disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`${btnH} p-0`}
            title="Last page"
          >
            <ChevronsRight className={iconSize} />
          </Button>
        )}

      </div>
    </div>
  );
}
