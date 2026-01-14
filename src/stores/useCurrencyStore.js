// stores/useCurrencyStore.js
import { currencyData } from "@/utils/CurrencyData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Default currency data
const defaultCurrencyData = currencyData;

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      // Current currency state
      currencySymbol: "৳",
      currencyCode: "BDT",

      // Available currencies
      availableCurrencies: defaultCurrencyData,

      // Actions
      setCurrency: (currencyData) => {
        set({
          currencySymbol: currencyData.symbol,
          currencyCode: currencyData.code,
        });
      },

      updateFromCompanyData: (companyData) => {
        if (companyData?.currencySymbol && companyData?.currencyCode) {
          set({
            currencySymbol: companyData.currencySymbol,
            currencyCode: companyData.currencyCode,
          });
        }
      },

      searchCurrencies: (searchTerm) => {
        const state = get();
        if (!searchTerm.trim()) return state.availableCurrencies;

        const term = searchTerm.toLowerCase();
        return state.availableCurrencies.filter(
          (currency) =>
            currency?.code.toLowerCase().includes(term) ||
            currency?.symbol.toLowerCase().includes(term) ||
            currency?.name.toLowerCase().includes(term)
        );
      },

      formatPrice: (price) => {
        const state = get();
        const formattedPrice = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price);

        return `${state.currencySymbol}${formattedPrice}`;
      },

      getCurrencyInfo: () => {
        const state = get();
        return {
          symbol: state.currencySymbol,
          code: state.currencyCode,
          availableCurrencies: state.availableCurrencies,
        };
      },
    }),
    {
      name: "currency-store",
      partialize: (state) => ({
        currencySymbol: state.currencySymbol,
        currencyCode: state.currencyCode,
      }),
    }
  )
);
