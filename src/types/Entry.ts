import type { Damage } from "./Damage";

type EntryType = "received" | "order" | "damage";

type DamageResolution = {
  type: "resolved" | "disposed";
  quantity: number;
  notes?: string;
};

export type Entry = {
  _id: string;
  itemCode: string;
  quantity: number;
  date: string;
  isExpress?: boolean;
  resolutionHistory?: DamageResolution[];
  type?: EntryType; // optional if not always used
};

export type GroupedEntry = {
  receipts: Entry[];
  orders: Entry[];
  damages: Damage[];
};
