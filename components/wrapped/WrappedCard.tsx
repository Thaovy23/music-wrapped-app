import { cn } from "@/lib/utils";

interface WrappedCardProps {
  index: number;
  total: number;
  label: string;
  value: string;
  subLabel?: string;
  emoji?: string;
  gradient?: string;
  active: boolean;
}

export function WrappedCard({
  index,
  total,
  label,
  value,
  subLabel,
  emoji,
  gradient = "from-zinc-900 to-zinc-800",
  active,
}: WrappedCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-sm mx-auto rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 select-none",
        `bg-gradient-to-br ${gradient}`,
        "border border-white/10 shadow-2xl",
        "transition-all duration-500",
        active ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
      )}
      style={{ minHeight: "480px" }}
    >
      {/* Step indicator */}
      <div className="absolute top-6 right-6 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Emoji */}
      {emoji && <p className="text-6xl">{emoji}</p>}

      {/* Label */}
      <p className="text-xs uppercase tracking-widest font-semibold text-white/60">
        {label}
      </p>

      {/* Value */}
      <p className="text-4xl font-extrabold text-white leading-tight">{value}</p>

      {/* Sub label */}
      {subLabel && (
        <p className="text-sm text-white/60 max-w-xs leading-relaxed">{subLabel}</p>
      )}
    </div>
  );
}
