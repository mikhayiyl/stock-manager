export type Damage = {
  _id: string;
  itemCode: string;
  quantity: number;
  notes: string;
  date: string;
  status: "pending" | "replaced" | "resold" | "disposed";
  productId: {
    name: string;
  };
};
