export type Damage = {
  _id: string;
  itemCode: string;
  quantity: number;
  date: string;
  notes: string;
  status: "pending" | "completed";
  productId: {
    name: string;
  };
  resolutionHistory: {
    type: "resolved" | "disposed";
    quantity: number;
    date: string;
    notes: string;
  }[];
};
