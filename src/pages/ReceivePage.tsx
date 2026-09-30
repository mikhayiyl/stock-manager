import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { ReceiveData } from "@/components/receive/ReceiveData";
import getAuthUser from "@/lib/auth";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ReceivePage() {
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const user = getAuthUser();
  const isAdmin = user?.isAdmin === true;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Receive stock</h2>
      {isAdmin && <ReceiveItemForm onStockUpdate={setHighlightId} />}
      {!isAdmin && (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <h3 className="font-semibold">
            Receiving stock is administrator-only
          </h3>
          <p className="mt-1">
            {user
              ? "Ask an administrator to grant your account access to receive stock."
              : "Sign in with an administrator account to receive stock."}
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
      <ReceiveData highlightId={highlightId} />
    </div>
  );
}
