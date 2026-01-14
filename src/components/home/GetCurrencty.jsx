"use client";

import { useCurrencyStore } from "@/stores/useCurrencyStore";

const GetCurrencty = () => {
  const { currencySymbol, formatPrice } = useCurrencyStore();
  return <>{currencySymbol}</>;
};

export default GetCurrencty;
