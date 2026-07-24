"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DynamicPricingResult,
  ProductPricing,
  formatCountdown,
  formatPrice,
  getDynamicPricingResult,
} from "@/lib/dynamicPricing";

export interface UseDynamicPricingOptions {
  /** Update interval in milliseconds. Defaults to 1000ms. */
  intervalMs?: number;
  currency?: string;
}

export interface UseDynamicPricingReturn extends DynamicPricingResult {
  formattedPrice: string;
  formattedOriginalPrice: string;
  formattedMinPrice: string;
  countdown: string;
}

export function useDynamicPricing(
  pricing: ProductPricing,
  options: UseDynamicPricingOptions = {}
): UseDynamicPricingReturn {
  const { intervalMs = 1000, currency = "TWD" } = options;
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, pricing.startTime, pricing.expireTime]);

  const result = useMemo(
    () => getDynamicPricingResult(pricing, now),
    [pricing, now]
  );

  const formattedPrice = useMemo(
    () => formatPrice(result.currentPrice, currency),
    [result.currentPrice, currency]
  );

  const formattedOriginalPrice = useMemo(
    () => formatPrice(pricing.originalPrice, currency),
    [pricing.originalPrice, currency]
  );

  const formattedMinPrice = useMemo(
    () => formatPrice(pricing.minPrice, currency),
    [pricing.minPrice, currency]
  );

  const countdown = useMemo(
    () => formatCountdown(result.timeRemaining),
    [result.timeRemaining]
  );

  return {
    ...result,
    formattedPrice,
    formattedOriginalPrice,
    formattedMinPrice,
    countdown,
  };
}
