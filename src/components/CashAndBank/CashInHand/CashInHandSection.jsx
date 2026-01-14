import { useCurrencyStore } from "@/stores/useCurrencyStore";

// Inline SVG for the 'Adjust' icon (Sliders)
const SlidersIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="1" x2="7" y1="14" y2="14" />
    <line x1="9" x2="15" y1="8" y2="8" />
    <line x1="17" x2="23" y1="16" y2="16" />
  </svg>
);

/**
 * Renders the Cash In Hand summary section with an adjustable button.
 * Uses a mock state for the cash amount.
 */
const CashInHandSection = ({ initialCash = 0, setIsModalOpen }) => {
  const { currencySymbol, formatPrice } = useCurrencyStore();
  return (
    <div className="w-full font-sans">
      {/* Main Bar Component */}
      <div className="w-full border-y border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Cash Details */}
          <div className="flex items-baseline space-x-2">
            {/* Static Label */}
            <span className="text-base sm:text-lg font-medium text-gray-800 whitespace-nowrap">
              Cash in Hand
            </span>

            {/* Dynamic Value - Teal color used for visual distinction as in the image */}
            {/* <span className={`text-xl sm:text-2xl font-bold text-teal-500`}>
              {initialCash + " "+ currency}
            </span> */}
            <span
              className={`text-xl sm:text-2xl font-bold ${
                initialCash < 0 ? "text-red-500" : "text-teal-500"
              }`}
            >
              {initialCash} {currencySymbol}
            </span>
          </div>

          {/* Adjust Cash Button - Bright Pink/Red color used to match the image */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer items-center space-x-1.5 sm:space-x-2 rounded-lg bg-red-600 px-3 py-1.5 sm:px-4 sm:py-2 text-white text-sm sm:text-base font-semibold shadow-md transition duration-150 ease-in-out hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <SlidersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Adjust Cash</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashInHandSection;
