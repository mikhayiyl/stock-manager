export const FILTERS = ["Damaged", "Low Stock", "Out of Stock"] as const;
export type FilterType = (typeof FILTERS)[number];
