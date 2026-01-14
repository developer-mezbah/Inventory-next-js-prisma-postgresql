import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useState } from "react";
import TransactionsTable from "./TransactionsTable";

const TabContents = () => {
  // Mock state for demonstration purposes
  const [data] = useState({
    title: "CHARGES ON LOAN",
  });
  const { currencySymbol, formatPrice } = useCurrencyStore();

  return (
    <div className="font-inter antialiased">
      {/* Main Card Container */}
      <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            {/* Title and Link Icon (Left Side) */}
            <div className="flex items-center text-lg font-semibold text-gray-800">
              <span className="mr-1">{data.title}</span>
            </div>

            {/* Action/Status Icons (Right Side) */}
            <div>
              <div className="text-right">
                Total :{" "}
                <span className="text-red-400">0.00 {currencySymbol}</span>
              </div>
              <div className="text-right">
                Balance :{" "}
                <span className="text-red-400">0.00 {currencySymbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Border (Matching the bottom line in the image) */}
        <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
        <TransactionsTable />
      </div>
    </div>
  );
};

export default TabContents;
