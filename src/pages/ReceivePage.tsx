import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { ReceiveData } from "@/components/receive/ReceiveData";
import getAuthUser from "@/lib/auth";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReceivePage() {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  const user = getAuthUser();
  const isAdmin = user?.isAdmin === true;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {isAdmin && (
          <button
            type="button"
            aria-expanded={isReceiveOpen}
            aria-controls="receive-stock-form"
            onClick={() => setIsReceiveOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            {isReceiveOpen ? (
              <>
                <X aria-hidden="true" className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus aria-hidden="true" className="size-4" />
                Receive stock
              </>
            )}
          </button>
        )}
      </div>
      {isAdmin && isReceiveOpen && (
        <div id="receive-stock-form" className="scroll-mt-4">
          <ReceiveItemForm onStockUpdate={setHighlightId} />
        </div>
      )}
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
