export type Receipt = {
  _id: string;
  itemCode: string;
  quantity: number;
  date: string;
  isExpress: boolean;
  client: string;
  deliveryNote: string;
};
