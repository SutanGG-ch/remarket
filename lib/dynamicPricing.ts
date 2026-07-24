export interface ProductPricing {
  originalPrice: number;
  minPrice: number;
  startTime: number;
  expireTime: number;
}

export interface TimeRemaining {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface DynamicPricingResult {
  currentPrice: number;
  discountPercent: number;
  progress: number;
  timeRemaining: TimeRemaining;
  isExpired: boolean;
  isAtFloor: boolean;
}

/**
 * Linear time decay pricing:
 * P(t) = max(P_min, P_original - (P_original - P_min) * elapsed / total)
 */
export function calculateDynamicPrice(
  pricing: ProductPricing,
  now: number = Date.now()
): number {
  const { originalPrice, minPrice, startTime, expireTime } = pricing;

  if (now <= startTime) {
    return originalPrice;
  }

  if (now >= expireTime) {
    return minPrice;
  }

  const elapsed = now - startTime;
  const total = expireTime - startTime;

  if (total <= 0) {
    return minPrice;
  }

  const decay = ((originalPrice - minPrice) * elapsed) / total;
  return Math.max(minPrice, originalPrice - decay);
}

export function getTimeRemaining(expireTime: number, now: number = Date.now()): TimeRemaining {
  const totalMs = Math.max(0, expireTime - now);

  if (totalMs === 0) {
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return { totalMs, hours, minutes, seconds, isExpired: false };
}

export function getDecayProgress(
  pricing: ProductPricing,
  now: number = Date.now()
): number {
  const { startTime, expireTime } = pricing;

  if (now <= startTime) {
    return 0;
  }

  if (now >= expireTime) {
    return 1;
  }

  const total = expireTime - startTime;
  if (total <= 0) {
    return 1;
  }

  return (now - startTime) / total;
}

export function getDynamicPricingResult(
  pricing: ProductPricing,
  now: number = Date.now()
): DynamicPricingResult {
  const currentPrice = calculateDynamicPrice(pricing, now);
  const timeRemaining = getTimeRemaining(pricing.expireTime, now);
  const progress = getDecayProgress(pricing, now);
  const isExpired = timeRemaining.isExpired;
  const isAtFloor = currentPrice <= pricing.minPrice || isExpired;

  const discountPercent =
    pricing.originalPrice > 0
      ? Math.round(((pricing.originalPrice - currentPrice) / pricing.originalPrice) * 100)
      : 0;

  return {
    currentPrice,
    discountPercent,
    progress,
    timeRemaining,
    isExpired,
    isAtFloor,
  };
}

export function formatPrice(amount: number, currency: string = "TWD"): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCountdown(time: TimeRemaining): string {
  if (time.isExpired) {
    return "00:00:00";
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
}
