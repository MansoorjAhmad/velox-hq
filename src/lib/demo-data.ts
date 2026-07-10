import { useEffect, useState } from "react";
import type { DashboardMetrics } from "./dashboard.functions";

const KEY = "velox:demo-mode";

export function useDemoMode(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  const set = (v: boolean) => {
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {}
    setEnabled(v);
  };

  return [enabled, set];
}

export const demoMetrics: DashboardMetrics = {
  netWorth: 42_180,
  totalDebt: 8_450,
  monthlyIncome: 6_720,
  tradingPnl: 3_284.5,
  deltas: {
    netWorth: 4.2,
    totalDebt: -6.1,
    monthlyIncome: 12.4,
    tradingPnl: 27.8,
  },
};
