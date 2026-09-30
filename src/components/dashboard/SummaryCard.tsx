import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import type { Order } from "@/types/Order";
import type { Product } from "@/types/Product";
import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
};

export function SummaryCards({ products, orders, isLoading }: Props) {
  const { isLowStock } = useLowStockAnalysis(orders);
  const metrics = [
    {
      title: "Products",
      value: products.length,
      Icon: Package,
      color: "text-blue-700 bg-blue-50",
    },
    {
      title: "Units on hand",
      value: products.reduce((sum, product) => sum + product.numberInStock, 0),
      Icon: Boxes,
      color: "text-teal-700 bg-teal-50",
    },
    {
      title: "Low stock",
      value: products.filter(isLowStock).length,
      Icon: AlertTriangle,
      color: "text-amber-700 bg-amber-50",
    },
    {
      title: "Out of stock",
      value: products.filter((product) => product.numberInStock <= 0).length,
      Icon: PackageX,
      color: "text-red-700 bg-red-50",
    },
    {
      title: "Damaged units",
      value: products.reduce((sum, product) => sum + product.damaged, 0),
      Icon: ShieldAlert,
      color: "text-orange-700 bg-orange-50",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4"
      aria-busy={isLoading}
    >
      {metrics.map(({ title, value, Icon, color }) => (
        <MetricCard
          key={title}
          title={title}
          value={value}
          Icon={Icon}
          color={color}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  Icon: LucideIcon;
  color: string;
  isLoading: boolean;
}) {
  return (
    <article className="min-w-0 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-md ${color}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      {isLoading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-gray-900">
          {value.toLocaleString()}
        </p>
      )}
    </article>
  );
}
