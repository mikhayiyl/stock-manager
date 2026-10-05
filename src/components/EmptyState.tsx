import { PackageOpen } from "lucide-react";

type Props = {
  message?: string;
};

export function EmptyState({ message = "No data available." }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-sm shadow-slate-900/[0.03]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
        <PackageOpen aria-hidden="true" className="size-[1.125rem]" />
      </span>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
