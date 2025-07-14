type EntryType = "received" | "order" | "damage";

export type Entry = {
  _id: string;
  itemCode: string;
  quantity: number;
  date: string;
  isExpress?: boolean;
  type?: EntryType; // optional if not always used
};
