"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  Leaf,
  ShoppingBag,
  Sparkles,
  Timer,
  TrendingDown,
} from "lucide-react";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { ProductPricing } from "@/lib/dynamicPricing";

interface FoodProduct {
  id: string;
  name: string;
  description: string;
  emoji: string;
  seller: string;
  quantity: number;
  originalPrice: number;
  minPrice: number;
  decayHours: number;
}

const FOOD_CATALOG: FoodProduct[] = [
  {
    id: "salmon-sashimi",
    name: "新鮮鮭魚握壽司組合",
    description: "當日現做，最佳賞味期限將至，動態降價中",
    emoji: "🍣",
    seller: "青田日式料理",
    quantity: 6,
    originalPrice: 480,
    minPrice: 120,
    decayHours: 3,
  },
  {
    id: "avocado-toast",
    name: "有機酪梨全麥吐司",
    description: "現烤麵包搭配季節酪梨，減少食物浪費首選",
    emoji: "🥑",
    seller: "GreenBite 輕食坊",
    quantity: 12,
    originalPrice: 180,
    minPrice: 45,
    decayHours: 2,
  },
  {
    id: "sourdough-bread",
    name: "手作酸種鄉村麵包",
    description: "天然發酵 48 小時，今日尾盤特價",
    emoji: "🍞",
    seller: "焙暖烘焙工作室",
    quantity: 8,
    originalPrice: 150,
    minPrice: 35,
    decayHours: 4,
  },
];

function buildPricing(product: FoodProduct, sessionStart: number): ProductPricing {
  const startTime = sessionStart;
  const expireTime = sessionStart + product.decayHours * 60 * 60 * 1000;

  return {
    originalPrice: product.originalPrice,
    minPrice: product.minPrice,
    startTime,
    expireTime,
  };
}

function ProductCard({
  product,
  sessionStart,
  onAddToCart,
}: {
  product: FoodProduct;
  sessionStart: number;
  onAddToCart: (id: string, price: number) => void;
}) {
  const pricing = buildPricing(product, sessionStart);
  const {
    formattedPrice,
    formattedOriginalPrice,
    formattedMinPrice,
    countdown,
    discountPercent,
    progress,
    isExpired,
    isAtFloor,
    currentPrice,
  } = useDynamicPricing(pricing);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/60">
      <div className="relative bg-gradient-to-br from-emerald-50 to-amber-50 px-6 py-8">
        <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          -{discountPercent}%
        </div>
        <div className="text-6xl" role="img" aria-label={product.name}>
          {product.emoji}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            {product.seller}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{product.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400 line-through">{formattedOriginalPrice}</p>
            <p className="text-3xl font-bold text-emerald-600">{formattedPrice}</p>
            <p className="mt-1 text-xs text-slate-400">底價 {formattedMinPrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">剩餘 {product.quantity} 份</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Timer className="h-4 w-4 text-amber-500" />
              價格倒數
            </span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                isExpired ? "text-slate-400" : "text-amber-500"
              }`}
              suppressHydrationWarning
            >
              {countdown}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isAtFloor ? "bg-slate-400" : "bg-gradient-to-r from-emerald-500 to-amber-400"
              }`}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {isExpired
              ? "已達最低價，請盡快取餐"
              : "價格隨時間線性遞減至底價"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
  alert("button works");
  onAddToCart(product.id, currentPrice);
}}
          disabled={product.quantity === 0}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingBag className="h-4 w-4" />
          立即搶購
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    setSessionStart(Date.now());
  }, []);

  const handleAddToCart = useCallback((id: string, price: number) => {
    setCartCount((prev) => prev + 1);
    const product = FOOD_CATALOG.find((p) => p.id === id);
    setLastAdded(`${product?.name ?? id} · ${Math.round(price)} 元`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-white to-amber-50/40">
      <header className="border-b border-emerald-100/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                ReMarket AI
              </h1>
              <p className="text-xs text-emerald-600">智慧動態定價 · 減少食物浪費</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700 sm:flex">
              <TrendingDown className="h-4 w-4" />
              <span>即時衰減定價引擎</span>
            </div>
            <div className="relative flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              <ShoppingBag className="h-4 w-4" />
              <span>{cartCount}</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-amber-500" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
            <Sparkles className="h-4 w-4" />
            今日限時動態優惠
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            拯救即期美食，<span className="text-emerald-600">越晚越划算</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            價格隨時間線性遞減至底價。越早購買品質越新鮮，越接近到期折扣越大——雙贏 ESG
            循環經濟模式。
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Clock, label: "即時倒數", value: "每秒更新" },
            { icon: TrendingDown, label: "線性衰減", value: "透明定價" },
            { icon: Leaf, label: "ESG 減廢", value: "3 件即期商品" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-semibold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </section>

        {lastAdded && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            已加入購物車：<span className="font-semibold">{lastAdded}</span>
          </div>
        )}

        {sessionStart === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FOOD_CATALOG.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sessionStart={sessionStart}
                onAddToCart={handleAddToCart}
              />
            ))}
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-emerald-100 bg-slate-900 p-8 text-center text-white">
          <h3 className="text-lg font-semibold">動態定價公式</h3>
          <p className="mx-auto mt-3 max-w-xl font-mono text-sm leading-relaxed text-emerald-300">
            P(t) = max(P<sub>min</sub>, P<sub>original</sub> − (P<sub>original</sub> −
            P<sub>min</sub>) × elapsed / total)
          </p>
          <p className="mt-4 text-sm text-slate-400">
            ReMarket AI 以時間驅動的線性衰減，平衡商家收益與消費者優惠，共同減少食物浪費。
          </p>
        </section>
      </main>

      <footer className="border-t border-emerald-100 py-6 text-center text-sm text-slate-400">
        © 2026 ReMarket AI · Next.js 14 · ESG 動態定價示範
      </footer>
    </div>
  );
}
