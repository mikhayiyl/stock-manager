import type { StockMovement, StockMovementType } from "@/types/StockMovement";

const movementLabels: Record<StockMovementType, string> = {
  opening_balance: "Opening balance",
  receipt: "Stock received",
  order: "Customer order",
  damage: "Damage reported",
  damage_resolution: "Damage restored",
  damage_disposal: "Damage disposed",
  receipt_reversal: "Receipt reversed",
  order_reversal: "Order reversed",
  damage_cancellation: "Damage report cancelled",
  restock: "Manual restock",
  adjustment: "Stock count adjustment",
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

type Props = {
  movements: StockMovement[];
  unitForMovement?: (movement: StockMovement) => string;
  productNameForMovement?: (movement: StockMovement) => string;
  showProduct?: boolean;
};

export function StockMovementTable({
  movements,
  unitForMovement = () => "",
  productNameForMovement = () => "",
  showProduct = false,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-emerald-50/70 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">
              Date
            </th>
            {showProduct && (
              <th scope="col" className="px-5 py-3 font-medium">
                Product
              </th>
            )}
            <th scope="col" className="px-5 py-3 font-medium">
              Activity
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Change
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Balance
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Recorded by
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Reason / reference
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((movement) => (
            <MovementRow
              key={movement._id}
              movement={movement}
              unit={unitForMovement(movement)}
              productName={productNameForMovement(movement)}
              showProduct={showProduct}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MovementRow({
  movement,
  unit,
  productName,
  showProduct,
}: {
  movement: StockMovement;
  unit: string;
  productName: string;
  showProduct: boolean;
}) {
  const positive = movement.stockChange > 0;
  const negative = movement.stockChange < 0;
  const stockChange =
    movement.stockChange > 0
      ? `+${movement.stockChange}`
      : movement.stockChange.toString();
  const reference = movement.referenceId
    ? `${movement.referenceType ?? "Record"}: ${movement.referenceId.slice(-8)}`
    : "";

  return (
    <tr>
      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
        {formatDate(movement.createdAt)}
      </td>
      {showProduct && (
        <td className="px-5 py-3">
          <span className="block font-medium text-gray-900">
            {productName || movement.itemCode}
          </span>
          <span className="block text-xs text-gray-500">
            {movement.itemCode}
          </span>
          <span className="block text-xs text-gray-500">
            {unit || "Unit not specified"}
          </span>
        </td>
      )}
      <td className="px-5 py-3 font-medium text-gray-900">
        {movementLabels[movement.type]}
      </td>
      <td
        className={`whitespace-nowrap px-5 py-3 font-semibold ${
          positive
            ? "text-green-700"
            : negative
              ? "text-red-700"
              : "text-gray-600"
        }`}
      >
        {stockChange} {unit}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-gray-700">
        {movement.balanceBefore} &rarr; {movement.balanceAfter} {unit}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
        {typeof movement.performedBy === "string"
          ? `User ${movement.performedBy.slice(-8)}`
          : movement.performedBy?.username ?? "Deleted user"}
      </td>
      <td className="max-w-xs px-5 py-3 text-gray-600">
        <span
          className="block truncate"
          title={movement.reason || reference || "—"}
        >
          {movement.reason || reference || "—"}
        </span>
        {movement.reason && reference && (
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {reference}
          </span>
        )}
      </td>
    </tr>
  );
}
