import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useMemo, useState } from "react";
import { BiShare } from "react-icons/bi";
import { LuSlidersHorizontal } from "react-icons/lu";
import AdjustItem from "./AdjustItem";
import ShareBar from "./ShareBar";

// --- DetailItem component (Kept as-is, adjusted to handle null/undefined stock data) ---
const DetailItem = ({
  label,
  value,
  isMonetary = false,
  isQuantity = false,
}) => {
  // Handle null or undefined values gracefully
  const displayValue = value === null || value === undefined ? "N/A" : value;
  let valueColorClass = "text-gray-900 font-medium"; // Default color
  let formattedDisplayValue = displayValue;
  const { currencySymbol, formatPrice } = useCurrencyStore();

  if (displayValue !== "N/A") {
    // Determine if the value is a negative number
    const isNegative = typeof displayValue === "number" && displayValue < 0;

    // Determine monetary formatting and colors
    const isMonetaryField =
      label === "SALE PRICE" ||
      label === "PURCHASE PRICE" ||
      label === "STOCK VALUE";

    if (isNegative) {
      // 🚨 Apply RED color for negative values
      valueColorClass = "text-red-600 font-semibold";
    } else if (isMonetaryField) {
      // 🟢 Apply GREEN color for non-negative monetary fields
      formattedDisplayValue = `${currencySymbol}${parseFloat(
        displayValue
      ).toFixed(2)}`;
      valueColorClass = "text-green-600 font-semibold";
    } else if (label === "Available for Sale") {
      // 🟢 Apply GREEN color for "Available for Sale"
      valueColorClass = "text-green-600 font-semibold";
    } else {
      // ⚫ Default color for all other non-N/A values
      valueColorClass = "text-gray-900 font-medium";
    }

    // Ensure monetary fields are formatted even if they are negative
    if (isMonetaryField && !isNegative) {
      formattedDisplayValue = `${currencySymbol}${parseFloat(
        displayValue
      ).toFixed(2)}`;
    } else if (isMonetaryField && isNegative) {
      // Format negative monetary value (e.g., -$10.00)
      formattedDisplayValue = `-${currencySymbol}${parseFloat(
        Math.abs(displayValue)
      ).toFixed(2)}`;
    }
  }

  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-600 pr-2">{label}:</span>
      <span className="border-dashed border-b flex-1"></span>
      <span className={valueColorClass}>{formattedDisplayValue}</span>
    </div>
  );
};
// --------------------------------------------------------------------------------------

/**
 * Renders the detail content for a selected inventory item.
 * @param {object} itemData - The full data object of the currently selected item.
 */
const TabContents = ({ itemData }) => {
  // Ensure itemData is available before proceeding
  if (!itemData) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        Item details not available.
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareBarOpen, setIsShareBarOpen] = useState(false);

  // Hardcoded currency symbol (You might want to fetch this globally)
  const currencySymbol = itemData.currencySymbol;

  // --- Dynamic Data Mapping and Calculation ---
  const { itemName, salePrice, purchasePrice, stock = {} } = itemData;

  // Assuming RESERVED QUANTITY is not in the data and is zero for this calculation.
  // Assuming STOCK VALUE = STOCK QUANTITY * PURCHASE PRICE.
  // Assuming AVAILABLE FOR SALE = STOCK QUANTITY - RESERVED QUANTITY.

  const stockQuantity = stock?.openingQuantity || 0;
  const reservedQuantity = 0; // Mocked or calculated if logic is provided
  const stockValue = stockQuantity * (purchasePrice || 0);
  const availableForSale = stockQuantity - reservedQuantity;

  // Format transaction data for the TransactionsTable
  const formatTransactionData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.map((item) => {
      const originalAmount = item.totalAmount;
      const balanceDue = item.balanceDue;

      let status;
      let statusAmount;

      if (balanceDue === 0) {
        status = "Paid";
        // When fully paid, show the original total amount
        statusAmount = originalAmount;
      } else if (balanceDue > 0 && balanceDue < originalAmount) {
        status = "Partially Paid";
        // When partially paid, show the amount paid (original - balance)
        statusAmount = originalAmount - balanceDue;
      } else if (balanceDue === originalAmount) {
        status = "Unpaid";
        // When fully unpaid, show the original amount due (or balanceDue)
        statusAmount = originalAmount;
      } else {
        // Fallback for cases like refunds or overpayments, if applicable
        status = "Pending/Other";
        statusAmount = originalAmount;
      }
      return {
        ...item,
        id: item.id,
        status,
        type: item.type,
        amount: item?.totalAmount,
        partyName: item?.party?.partyName,
      };
    });
  };

  const formattedTransactionData = formatTransactionData(
    itemData?.transaction || []
  );

  // Data structure for the DetailItem components
  const itemDetails = useMemo(() => {
    return {
      name: itemName,
      salePrice: salePrice,
      purchasePrice: purchasePrice,
      availableForSale: availableForSale,
      stockQuantity: stockQuantity,
      stockValue: stockValue,
      reservedQuantity: reservedQuantity,
    };
  }, [
    itemName,
    salePrice,
    purchasePrice,
    stockQuantity,
    availableForSale,
    stockValue,
    reservedQuantity,
  ]);

  // Split details into left and right columns for desktop view
  const leftDetails = [
    { label: "SALE PRICE", value: itemDetails.salePrice },
    { label: "PURCHASE PRICE", value: itemDetails.purchasePrice },
    {
      label: "Available for Sale",
      value: itemDetails.availableForSale,
      isQuantity: true,
    },
  ];

  const rightDetails = [
    { label: "STOCK QUANTITY", value: itemDetails.stockQuantity },
    { label: "STOCK VALUE", value: itemDetails.stockValue },
    { label: "RESERVED QUANTITY", value: itemDetails.reservedQuantity },
  ];

  return (
    <div className="font-inter antialiased">
      {/* Main Card Container */}
      <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
        <div className="p-4 bg-white shadow-lg rounded-tl-lg rounded-tr-lg mx-auto border border-gray-200 mb-5">
          {/* Header Section */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
            {/* Product Name and Icon */}
            <div className="flex relative items-center overflow-visible text-sm sm:text-lg font-semibold text-gray-800 tracking-wider">
              <span className="uppercase mr-2">{itemDetails.name}</span>{" "}
              {/* Dynamic Item Name */}
              <BiShare
                onClick={() => setIsShareBarOpen(!isShareBarOpen)}
                className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors"
              ></BiShare>
              {isShareBarOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsShareBarOpen(!isShareBarOpen)}
                />
              )}
              <div
                className={`absolute z-20 sm:-right-100 top-5 w-100 ${
                  isShareBarOpen ? "block" : "hidden"
                }`}
              >
                <ShareBar />
              </div>
            </div>

            {/* Adjust Item Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              <LuSlidersHorizontal className="w-4 h-4 mr-2" />
              ADJUST ITEM
            </button>
          </div>
          {/* */}

          <AdjustItem
            isVisible={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            item={itemData} // Pass the full item data to AdjustItem
          />

          {/* Details Grid Section - Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            {/* Left Column Details */}
            <div className="space-y-1">
              {leftDetails.map((item) => (
                <DetailItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>

            {/* Right Column Details - Separated by an empty div for clean grid alignment on smaller screens */}
            <div className="sm:hidden">
              <div className="w-full h-px bg-gray-100 my-4"></div>{" "}
              {/* Separator for Mobile */}
            </div>

            <div className="space-y-1 sm:mt-0">
              {rightDetails.map((item) => (
                <DetailItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Bottom Border (Matching the bottom line in the image) */}
        <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
        <TransactionsTable
          data={formattedTransactionData}
          itemsPerPage={10}
          showPagination={true}
          userProvidedColumns={[
            {
              key: "status",
              label: "Status",
              sortable: true,
              type: "status",
              className: "text-left font-semibold",
            },
            {
              key: "type",
              label: "type",
              sortable: true,
              type: "badge",
              className: "text-left font-semibold",
            },
            // {
            //   key: "partyName",
            //   label: "Party Name",
            //   sortable: true,
            //   className: "text-left font-semibold",
            // },
            {
              key: "paymentType",
              label: "Payment Type",
              sortable: true,
              type: "badge",
              className: "text-left font-semibold",
            },
            {
              key: "amount",
              label: "Amount",
              sortable: true,
              type: "currency",
              className: "text-left font-semibold",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TabContents;
