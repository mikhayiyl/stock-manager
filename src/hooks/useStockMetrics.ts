import type { GroupedEntry } from "@/types/Entry";
import type { Product } from "@/types/Product";

export type StockReportRange = { from: string; to: string };

export type StockMovementRow = {
  id: string;
  type: string;
  quantity: number;
  stockChange: number;
  balanceAfter: number;
  unmatchedOutbound: number;
  date: string;
  notes: string;
};

type RawStockMovement = Omit<
  StockMovementRow,
  "balanceAfter" | "unmatchedOutbound"
>;

export type StockMetrics = {
  name: string;
  unit: string;
  currentStock: number;
  totalReceived: number;
  totalExpress: number;
  totalOrdered: number;
  totalDamaged: number;
  totalRestored: number;
  totalDisposed: number;
  previousBalance: number;
  movementTotal: number;
  closingBalance: number;
  unmatchedOutbound: number;
  hasReconciliationIssue: boolean;
  movements: StockMovementRow[];
};

function isWithinRange(dateString: string, range: StockReportRange): boolean {
  const time = new Date(dateString).getTime();
  if (!Number.isFinite(time)) return false;

  const from = range.from
    ? new Date(`${range.from}T00:00:00`).getTime()
    : -Infinity;
  const to = range.to
    ? new Date(`${range.to}T23:59:59.999`).getTime()
    : Infinity;

  return time >= from && time <= to;
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateStockMetrics(
  itemCode: string,
  entry: GroupedEntry,
  product?: Product,
  range: StockReportRange = { from: "", to: "" },
): StockMetrics {
  const name = product?.name ?? itemCode;
  const unit = product?.unit ?? "";
  const currentStock = product?.numberInStock ?? 0;
  const allMovements: RawStockMovement[] = [];

  entry.receipts.forEach((receipt) => {
    allMovements.push({
      id: `receipt-${receipt._id}`,
      type: receipt.isExpress
        ? "Express delivery (no stock change)"
        : "Stock received",
      quantity: receipt.quantity,
      stockChange: receipt.isExpress ? 0 : receipt.quantity,
      date: receipt.date,
      notes: "",
    });
  });

  entry.orders.forEach((order) => {
    allMovements.push({
      id: `order-${order._id}`,
      type: "Customer order",
      quantity: -order.quantity,
      stockChange: -order.quantity,
      date: order.date,
      notes: "",
    });
  });

  entry.damages.forEach((damage) => {
    allMovements.push({
      id: `damage-${damage._id}`,
      type: "Damage reported",
      quantity: -damage.quantity,
      stockChange: -damage.quantity,
      date: damage.date,
      notes: damage.notes ?? "",
    });

    damage.resolutionHistory?.forEach((resolution, index) => {
      const resolved = resolution.type === "resolved";
      allMovements.push({
        id: `damage-${damage._id}-resolution-${index}`,
        type: resolved
          ? "Damage resolved"
          : "Damage disposed (no stock change)",
        quantity: resolution.quantity,
        stockChange: resolved ? resolution.quantity : 0,
        date: resolution.date,
        notes: resolution.notes ?? "",
      });
    });
  });

  const datedMovements = allMovements
    .filter((movement) => Number.isFinite(new Date(movement.date).getTime()))
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime(),
    );
  const movements = datedMovements.filter((movement) =>
    isWithinRange(movement.date, range),
  );

  const totalReceived = movements
    .filter((movement) => movement.type === "Stock received")
    .reduce((sum, movement) => sum + movement.quantity, 0);
  const totalExpress = movements
    .filter((movement) => movement.type.startsWith("Express delivery"))
    .reduce((sum, movement) => sum + movement.quantity, 0);
  const totalOrdered = movements
    .filter((movement) => movement.type === "Customer order")
    .reduce((sum, movement) => sum + Math.abs(movement.quantity), 0);
  const totalDamaged = movements
    .filter((movement) => movement.type === "Damage reported")
    .reduce((sum, movement) => sum + Math.abs(movement.quantity), 0);
  const totalRestored = movements
    .filter((movement) => movement.type === "Damage resolved")
    .reduce((sum, movement) => sum + movement.quantity, 0);
  const totalDisposed = movements
    .filter((movement) => movement.type.startsWith("Damage disposed"))
    .reduce((sum, movement) => sum + movement.quantity, 0);
  const movementTotal = movements.reduce(
    (sum, movement) => sum + movement.stockChange,
    0,
  );

  const allTimeStockChange = datedMovements.reduce(
    (sum, movement) => sum + movement.stockChange,
    0,
  );
  const inferredOpeningBalance =
    currentStock -
    allTimeStockChange +
    datedMovements
      .filter((movement) => {
        const rangeStart = range.from
          ? new Date(`${range.from}T00:00:00`).getTime()
          : -Infinity;
        return new Date(movement.date).getTime() < rangeStart;
      })
      .reduce((sum, movement) => sum + movement.stockChange, 0);

  const previousBalance = Math.max(0, inferredOpeningBalance);
  let runningBalance = previousBalance;
  let unmatchedOutbound = Math.max(0, -inferredOpeningBalance);

  const movementsWithBalances: StockMovementRow[] = movements.map(
    (movement) => {
      const attemptedBalance = runningBalance + movement.stockChange;
      const shortfall = Math.max(0, -attemptedBalance);
      runningBalance = Math.max(0, attemptedBalance);
      unmatchedOutbound += shortfall;

      return {
        ...movement,
        balanceAfter: runningBalance,
        unmatchedOutbound: shortfall,
      };
    },
  );

  const closingBalance = runningBalance;
  const rangeIncludesCurrentDay =
    !range.to || range.to >= toLocalDateString(new Date());
  const hasReconciliationIssue =
    unmatchedOutbound > 0 ||
    (rangeIncludesCurrentDay && closingBalance !== currentStock);

  return {
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
    closingBalance,
    unmatchedOutbound,
    hasReconciliationIssue,
    movements: movementsWithBalances,
  };
}
