"use client";

import { useTransportModeFilterContext } from "@/contexts/TransportModeFilterContext";

export function useTransportModeFilter() {
  return useTransportModeFilterContext();
}
