import useOrders from "@/hooks/useOrders";
import { useState, useEffect } from "react";
import { OrderFilters } from "./OrderFilters";
import { OrdersTable } from "./OrdersTable";
import { PaginationControls } from "./PaginationControls";
import { useDebounce } from "@/hooks/useDebounce";

type Props = {
  highlightId: string | null;
};

export function Orders({ highlightId }: Props) {
  const { orders, isLoading } = useOrders();

  const [filters, setFilters] = useState({
    itemCode: "",
    orderNumber: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce filters to avoid rapid re-renders
  const debouncedFilters = useDebounce(filters, 400);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const filtered = orders.filter((order) => {
    const orderDateStr = new Date(order.date).toISOString().slice(0, 10); // e.g., "2025-07-14"

    const matchesItemCode = order.itemCode
      .toLowerCase()
      .includes(debouncedFilters.itemCode.toLowerCase());

    const matchesOrderNumber = order.orderNumber
      .toLowerCase()
      .includes(debouncedFilters.orderNumber.toLowerCase());

    const afterStart =
      !debouncedFilters.startDate || orderDateStr >= debouncedFilters.startDate;

    const beforeEnd =
      !debouncedFilters.endDate || orderDateStr <= debouncedFilters.endDate;

    return matchesItemCode && matchesOrderNumber && afterStart && beforeEnd;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {orders.length > 0 && (
        <OrderFilters filters={filters} setFilters={setFilters} />
      )}

      <OrdersTable
        isLoading={isLoading}
        itemsPerPage={itemsPerPage}
        orders={paginated}
        highlightId={highlightId}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}
