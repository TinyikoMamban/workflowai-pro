import { ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ confidence, className }: { confidence?: number; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="flex-1">
        <span className="font-medium text-foreground">Responsible AI:</span> AI-generated content may
        contain inaccuracies. Always verify important information before professional use.
        {typeof confidence === "number" && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            <Sparkles className="size-3" /> Confidence {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
