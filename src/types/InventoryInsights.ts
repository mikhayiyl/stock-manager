export type InsightPriority = "urgent" | "watch" | "positive";

export type InsightCategory =
  | "replenishment"
  | "inventory_health"
  | "demand"
  | "operations";

export type InventoryInsight = {
  priority: InsightPriority;
  category: InsightCategory;
  title: string;
  observation: string;
  recommendation: string;
  itemCodes: string[];
};

export type InventoryInsightMetrics = {
  totalProducts: number;
  totalUnitsOnHand: number;
  lowStockCount: number;
  outOfStockCount: number;
  damagedUnits: number;
  ordersLast30Days: number;
  unitsOrderedLast30Days: number;
  unitsReceivedLast30Days: number;
  expressDeliveriesLast30Days: number;
};

export type InventoryInsightsResponse = {
  periodDays: number;
  generatedAt: string;
  cached: boolean;
  metrics: InventoryInsightMetrics;
  summary: string;
  insights: InventoryInsight[];
};
