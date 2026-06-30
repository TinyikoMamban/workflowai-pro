import { cn } from "@/lib/utils";
import logoAsset from "@/assets/workflow-logo.png.asset.json";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="WorkFlow AI Pro"
      className={cn("object-contain select-none", className)}
      draggable={false}
    />
  );
}

export function BrandLockup({
  className,
  textClassName,
  size = "md",
}: {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-9";
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrandMark className={mark} />
      <span
        className={cn(
          "font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent",
          text,
          textClassName,
        )}
      >
        WorkFlow AI Pro
      </span>
    </div>
  );
}
