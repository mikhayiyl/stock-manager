import type { Damage } from "@/types/Damage";
import type { Entry } from "@/types/Entry";
import type { Product } from "@/types/Product";
import {
  calculateStockMetrics,
  type StockReportRange,
} from "@/hooks/useStockMetrics";

type Props = {
  itemCode: string;
  receipts: Entry[];
  orders: Entry[];
  damages: Damage[];
  product?: Product;
  range: StockReportRange;
};

export function StockCard({
  itemCode,
  receipts,
  orders,
  damages,
  product,
  range,
}: Props) {
  const {
    name,
    unit,
    currentStock,
    totalReceived,
    totalExpress,
    totalOrdered,
    totalDamaged,
    totalRestored,
    totalDisposed,
    previousBalance,
    movementTotal,
    movements,
    closingBalance,
    unmatchedOutbound,
    hasReconciliationIssue,
  } = calculateStockMetrics(
    itemCode,
    { receipts, orders, damages },
    product,
    range,
  );

  return (
    <article className="min-w-0 space-y-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm print-page">
      <h3 className="break-words text-base font-semibold text-gray-900">
        {name}
        <span className="ml-2 font-mono text-xs font-normal text-gray-500">
          {itemCode}
        </span>
      </h3>

      <dl className="grid grid-cols-2 gap-3 border-y border-gray-100 py-3 text-sm sm:grid-cols-4">
        <Summary label="Opening balance" value={previousBalance} unit={unit} />
        <Summary label="Net change" value={movementTotal} unit={unit} />
        <Summary label="Closing balance" value={closingBalance} unit={unit} />
        <Summary label="Current stock now" value={currentStock} unit={unit} />
        <Summary
          label="Unmatched outbound"
          value={unmatchedOutbound}
          unit={unit}
        />
        <Summary
          label="Received into stock"
          value={totalReceived}
          unit={unit}
        />
        <Summary
          label="Express (not stocked)"
          value={totalExpress}
          unit={unit}
        />
        <Summary label="Customer orders" value={totalOrdered} unit={unit} />
        <Summary label="Damage reported" value={totalDamaged} unit={unit} />
        <Summary label="Resolved to stock" value={totalRestored} unit={unit} />
        <Summary label="Disposed" value={totalDisposed} unit={unit} />
      </dl>

      {hasReconciliationIssue && (
        <p
          className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          Running balances are clamped at zero.{" "}
          {unmatchedOutbound > 0
            ? `${unmatchedOutbound} ${unit} of outbound quantity could not be matched to recorded stock. `
            : "Recorded movements do not reconcile to current stock. "}
          Check for missing opening stock or incorrect transaction dates.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-600">
            <tr>
              <th className="px-2 py-2 font-medium">Activity</th>
              <th className="px-2 py-2 font-medium">Quantity</th>
              <th className="px-2 py-2 font-medium">Stock change</th>
              <th className="px-2 py-2 font-medium">Balance after</th>
              <th className="px-2 py-2 font-medium">Unmatched outbound</th>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} className="border-b last:border-0">
                <td className="px-2 py-2">{movement.type}</td>
                <td className="px-2 py-2 tabular-nums">
                  {movement.quantity.toLocaleString()} {unit}
                </td>
                <td className="px-2 py-2 tabular-nums">
                  {movement.stockChange === 0
                    ? "—"
                    : `${movement.stockChange > 0 ? "+" : ""}${movement.stockChange.toLocaleString()} ${unit}`}
                </td>
                <td className="px-2 py-2 tabular-nums">
                  {movement.balanceAfter.toLocaleString()} {unit}
                </td>
                <td className="px-2 py-2 tabular-nums">
                  {movement.unmatchedOutbound > 0
                    ? `${movement.unmatchedOutbound.toLocaleString()} ${unit}`
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-2 py-2">
                  {new Date(movement.date).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="max-w-48 break-words px-2 py-2 text-gray-600">
                  {movement.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Summary({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold tabular-nums text-gray-900">
        {value.toLocaleString()} {unit}
      </dd>
    </div>
  );
}
