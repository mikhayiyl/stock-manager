export type StockMovementType =
  | "opening_balance"
  | "receipt"
  | "order"
  | "damage"
  | "damage_resolution"
  | "damage_disposal"
  | "receipt_reversal"
  | "order_reversal"
  | "damage_cancellation"
  | "restock"
  | "adjustment";

export type StockMovement = {
  _id: string;
  productId: string;
  itemCode: string;
  type: StockMovementType;
  quantity: number;
  stockChange: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: string | { _id: string; username: string } | null;
  createdAt: string;
};

export type PaginatedStockMovements = {
  items: StockMovement[];
  total: number;
  page: number;
  pageSize: number;
};
