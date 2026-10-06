import getAuthUser from "@/lib/auth";
import type { Damage } from "@/types/Damage";
import { format } from "date-fns";

interface Product {
  itemCode: string;
  name: string;
}

interface DamageCardProps {
  damage: Damage;
  product?: Product;
  onResolve: (damage: Damage, type: "resolved" | "disposed") => void;
}

const DamageCard = ({ damage, product, onResolve }: DamageCardProps) => {
  const resolved = damage.resolutionHistory.reduce(
    (sum, r) => (r.type === "resolved" ? sum + r.quantity : sum),
    0
  );

  const disposed = damage.resolutionHistory.reduce(
    (sum, r) => (r.type === "disposed" ? sum + r.quantity : sum),
    0
  );

  const totalResolved = resolved + disposed;
  const remaining = damage.quantity - totalResolved;
  const isAdmin = getAuthUser()?.isAdmin;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white space-y-2">
      <div className="font-semibold text-[17px] flex justify-between">
        <span>{product?.name ?? "—"}</span>
        <span className="text-xs text-gray-500">{damage.itemCode}</span>
      </div>

      <div className="text-[15px] text-gray-700">
        Reported: {damage.quantity} on {format(new Date(damage.date), "PPP")}
      </div>

      <div className="text-[15px] text-gray-700">
        <div>Progress:</div>
        <div className="flex gap-2 pt-1 text-xs">
          {resolved > 0 && (
            <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-emerald-800">
              ✅ {resolved} Resolved
            </span>
          )}
          {disposed > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-0.5  rounded-sm">
              🗑️ {disposed} Disposed
            </span>
          )}
          {remaining > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm">
              ⏳ {remaining} Pending
            </span>
          )}
        </div>
      </div>

      {damage.resolutionHistory.length > 0 && (
        <div className="border-t pt-2 text-xs text-gray-600 space-y-1">
          <div className="font-medium">Resolution History:</div>
          {damage.resolutionHistory.map((entry, i) => (
            <div key={i}>
              {entry.type === "resolved" ? "✅" : "🗑️"} {entry.quantity}{" "}
              {entry.type} on {format(new Date(entry.date), "PPP")}{" "}
              <span className="italic text-gray-400">({entry.notes})</span>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && isAdmin && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onResolve(damage, "resolved")}
            className="rounded-full bg-emerald-700 px-3 py-0.5 text-xs text-white hover:bg-emerald-800"
          >
            Resolve
          </button>
          <button
            onClick={() => onResolve(damage, "disposed")}
            className="px-3 py-0.5 rounded-full text-xs bg-red-600 text-white hover:bg-red-700"
          >
            Dispose
          </button>
        </div>
      )}
    </div>
  );
};

export default DamageCard;
