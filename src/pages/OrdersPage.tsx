import { useState } from "react";
import getAuthUser from "@/lib/auth";
import { Orders } from "@/components/orders/Orders";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const user = getAuthUser();
  const isAdmin = user?.isAdmin === true;

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <h2 className="font-semibold">
            Order creation is administrator-only
          </h2>
          <p className="mt-1">
            {user
              ? "Ask an administrator to grant your account access to process orders."
              : "Sign in with an administrator account to process orders."}
          </p>
          {!user && (
            <Link
              to="/login"
              className="mt-3 inline-block font-medium text-amber-900 underline underline-offset-2"
            >
              Sign in
            </Link>
          )}
        </section>
      )}
      <Orders
        highlightId={lastOrderId}
        canCreate={isAdmin}
        onOrderComplete={setLastOrderId}
      />
    </div>
  );
}
