import apiClient from "./api-client";
import type { InventoryInsightsResponse } from "@/types/InventoryInsights";

export function generateInventoryInsights() {
  return apiClient.get<InventoryInsightsResponse>("/insights");
}
