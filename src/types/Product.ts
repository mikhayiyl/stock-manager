export type Product = {
  id: number;
  itemCode: string; // Unique identifier (e.g. TIN-ROOF28)
  name: string; // Descriptive product name
  numberInStock: number; // Current available quantity
  received: string; // ISO date string of last stock-in
  damaged: number; // Number of units marked as damaged
  unit: string; // Optional: pcs, bags, boxes, etc.
};
