import useOrders from "@/hooks/useOrders";
import { useEffect, useState } from "react";
import { OrderFilters } from "./OrderFilters";
import { OrdersTable } from "./OrdersTable";
import { OrderForm } from "./OrderForm";
import { Plus, X } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "../PaginationBar";

type Props = {
  highlightId: string | null;
  canCreate: boolean;
  onOrderComplete: (orderId: string) => void;
};

export function Orders({ highlightId, canCreate, onOrderComplete }: Props) {
  const { orders, isLoading } = useOrders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <section className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <button
            type="button"
            aria-expanded={isCreateOpen}
            aria-controls="order-create-form"
            onClick={() => setIsCreateOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
          >
            {isCreateOpen ? (
              <>
                <X aria-hidden="true" className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus aria-hidden="true" className="size-4" />
                Create order
              </>
            )}
          </button>
        </div>
      )}

      {canCreate && isCreateOpen && (
        <div id="order-create-form" className="scroll-mt-4">
          <OrderForm
            onOrderComplete={(orderId) => {
              onOrderComplete(orderId);
              setIsCreateOpen(false);
            }}
          />
        </div>
      )}

      {orders.length > 0 && (
        <OrderFilters filters={filters} setFilters={setFilters} />
      )}

      <OrdersTable
        isLoading={isLoading}
        itemsPerPage={itemsPerPage}
        orders={paginated}
        highlightId={highlightId}
      />

      <Pagination
        totalItems={filtered.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
