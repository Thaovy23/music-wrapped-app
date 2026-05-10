interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
}

export function StatCard({ label, value, subLabel }: StatCardProps) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-1">
      <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-4xl font-bold text-white">{value}</p>
      {subLabel && <p className="text-sm text-zinc-500">{subLabel}</p>}
    </div>
  );
}
