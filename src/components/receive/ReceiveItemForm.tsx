import productClient from "@/services/product-client";
import receiptClient from "@/services/receipt-client";
import type { Product } from "@/types/Product";
import { CanceledError, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
  itemCode: string;
  name: string;
  unit: string;
  quantity: number;
  isExpress: boolean;
  client: string;
  deliveryNote: string;
};

type Props = {
  onStockUpdate: (updatedId: string) => void;
};

export function ReceiveItemForm({ onStockUpdate }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { isExpress: false, client: "", deliveryNote: "" },
  });

  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isLookingUpProduct, setIsLookingUpProduct] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const itemCode = watch("itemCode");
  const isExpress = watch("isExpress");
  const normalizedItemCode = itemCode?.trim() ?? "";
  const currentProduct =
    matchedProduct?.itemCode === normalizedItemCode ? matchedProduct : null;

  useEffect(() => {
    let isCurrentRequest = true;
    setMatchedProduct(null);

    if (!normalizedItemCode) {
      setIsLookingUpProduct(false);
      return;
    }

    setIsLookingUpProduct(true);
    const { request, cancel } = productClient.getAll<Product>({
      itemCode: normalizedItemCode,
    });

    request
      .then((response) => {
        if (!isCurrentRequest) return;
        setMatchedProduct(
          response.data.find(
            (product) => product.itemCode === normalizedItemCode,
          ) ?? null,
        );
      })
      .catch((error) => {
        if (!isCurrentRequest || error instanceof CanceledError) return;
        console.error("Product lookup failed:", error);
      })
      .finally(() => {
        if (isCurrentRequest) setIsLookingUpProduct(false);
      });

    return () => {
      isCurrentRequest = false;
      cancel();
    };
  }, [normalizedItemCode]);

  const onSubmit = async (data: FormData) => {
    if (!Number.isFinite(data.quantity) || data.quantity < 1) return;
    if (isLookingUpProduct) {
      toast.error("Wait for the item lookup to finish.");
      return;
    }

    const code = data.itemCode.trim();
    const product = matchedProduct?.itemCode === code ? matchedProduct : null;

    if (!data.isExpress && !product) {
      const name = data.name?.trim() ?? "";
      if (name.length < 5 || name.length > 50) {
        setError("name", {
          type: "validate",
          message: "Product name must be 5 to 50 characters",
        });
        setFocus("name");
        return;
      }

      const unit = data.unit?.trim() ?? "";
      if (unit.length < 1 || unit.length > 20) {
        setError("unit", {
          type: "validate",
          message: "Unit must be 1 to 20 characters",
        });
        setFocus("unit");
        return;
      }
    }

    try {
      setSubmitError(null);
      const response = await receiptClient.create({
        itemCode: code,
        quantity: data.quantity,
        date: new Date().toISOString(),
        isExpress: data.isExpress,
        client: data.isExpress ? data.client.trim() : null,
        deliveryNote: data.isExpress ? data.deliveryNote.trim() : null,
        name: data.isExpress ? undefined : (product?.name ?? data.name.trim()),
        unit: data.isExpress ? undefined : (product?.unit ?? data.unit.trim()),
      });

      toast.success(
        data.isExpress ? "Express delivery logged." : "Stock receipt logged.",
      );
      reset();
      setMatchedProduct(null);
      window.dispatchEvent(new Event("receipts:refresh"));
      if (!data.isExpress) window.dispatchEvent(new Event("products:refresh"));

      if (!data.isExpress && response.data?._id) {
        onStockUpdate(response.data._id);
      }
    } catch (error) {
      console.error("Receipt failed:", error);
      const responseData = isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof responseData === "string"
          ? responseData
          : "Failed to save receipt. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-900">Add item</h3>
      <div>
        <label className="text-sm font-medium" htmlFor="receipt-item-code">
          Item code
        </label>
        <input
          id="receipt-item-code"
          {...register("itemCode", {
            required: "Item code is required",
            minLength: {
              value: 5,
              message: "Item code must be at least 5 characters",
            },
            maxLength: {
              value: 50,
              message: "Item code cannot exceed 50 characters",
            },
          })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="e.g. CEM-50GREY"
        />
        {errors.itemCode && (
          <p className="mt-1 text-sm text-red-600">{errors.itemCode.message}</p>
        )}
      </div>

      {currentProduct ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
          <p>
            <strong>Item:</strong> {currentProduct.name}
          </p>
          <p>
            <strong>Current stock:</strong> {currentProduct.numberInStock}{" "}
            {currentProduct.unit}
          </p>
        </div>
      ) : isLookingUpProduct ? (
        <p className="text-sm text-gray-500" role="status">
          Checking item code...
        </p>
      ) : !isExpress ? (
        <>
          <div>
            <label
              className="text-sm font-medium"
              htmlFor="receipt-product-name"
            >
              Product name
            </label>
            <input
              id="receipt-product-name"
              {...register("name", {
                minLength: {
                  value: 5,
                  message: "Name must be at least 5 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name cannot exceed 50 characters",
                },
              })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              className="text-sm font-medium"
              htmlFor="receipt-product-unit"
            >
              Unit
            </label>
            <input
              id="receipt-product-unit"
              {...register("unit", {
                minLength: { value: 1, message: "Unit is required" },
                maxLength: {
                  value: 20,
                  message: "Unit cannot exceed 20 characters",
                },
              })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g. pcs, bags"
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
        </>
      ) : null}

      <div>
        <label className="text-sm font-medium" htmlFor="receipt-quantity">
          Quantity received
        </label>
        <input
          id="receipt-quantity"
          type="number"
          min={1}
          step="any"
          {...register("quantity", {
            valueAsNumber: true,
            required: "Quantity is required",
            validate: (value) =>
              (Number.isFinite(value) && value >= 1) ||
              "Quantity must be at least 1",
          })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="e.g. 100"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="receipt-is-express"
          type="checkbox"
          {...register("isExpress")}
          className="size-4 accent-blue-700"
        />
        <label htmlFor="receipt-is-express" className="text-sm font-medium">
          Express delivery (does not add stock)
        </label>
      </div>

      {isExpress && (
        <>
          <div>
            <label className="text-sm font-medium" htmlFor="receipt-client">
              Client name
            </label>
            <input
              id="receipt-client"
              {...register("client", {
                required: "Client name is required",
                maxLength: {
                  value: 100,
                  message: "Client name cannot exceed 100 characters",
                },
              })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g. Ali & Sons Paints"
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">
                {errors.client.message}
              </p>
            )}
          </div>
          <div>
            <label
              className="text-sm font-medium"
              htmlFor="receipt-delivery-note"
            >
              Delivery note
            </label>
            <input
              id="receipt-delivery-note"
              {...register("deliveryNote", {
                maxLength: {
                  value: 200,
                  message: "Delivery note cannot exceed 200 characters",
                },
              })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g. DN-0423"
            />
            {errors.deliveryNote && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryNote.message}
              </p>
            )}
          </div>
        </>
      )}

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isLookingUpProduct}
        className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Saving..."
          : isExpress
            ? "Log express delivery"
            : "Receive stock"}
      </button>
    </form>
  );
}
