"use client";
import CashAdjustmentModal from "@/components/CashAndBank/CashInHand/CashAdjustmentModal";
import CashInHandSection from "@/components/CashAndBank/CashInHand/CashInHandSection";
import CashSection from "@/components/CashAndBank/CashInHand/CashSection";
// import TransactionsTable from "@/components/CashAndBank/CashInHand/TransactionTable";
import Loading from "@/components/Loading";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { useFetchData } from "@/hook/useFetchData";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  // State variables for the form
  const [adjustmentType, setAdjustmentType] = useState("Add Cash");
  const [amount, setAmount] = useState("");
  // Set default date to today in YYYY-MM-DD format
  const [adjustmentDate, setAdjustmentDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const [updateAmount, setUpdateAmount] = useState(0);
  const { currencySymbol, formatPrice } = useCurrencyStore();
  // Mock data for display
  const [currentCash, setCurrentCash] = useState(0);
  const { data: session } = useSession();

  const { isInitialLoading, error, data, refetch } = useFetchData(
    `/api/cashadjustment/${session?.user?.id}`,
    ["single-cashadjustment"]
  );

  useEffect(() => {
    if (data) {
      setCurrentCash(data?.cashInHand || 0);
    }
  }, [data]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    // Reset form state and status message when closing
    setAdjustmentType("Add Cash");
    setAmount("");
    setDescription("");
    setStatusMessage({ text: "", type: "" });
    setIsModalOpen(false);
    setIsEdit(false);
    setUpdateAmount(0);
  };
  // Mock API Call to simulate network latency and potential errors
  const mockApiSave = (data) => {
    const adjustedCash =
      currentCash +
      (data.adjustmentType === "Add Cash" ? data.amount : -data.amount);
    client_api
      .update(`/api/cashadjustment/${session?.user?.id}`, "token", {
        ...data,
        amount: data?.amount,
        cashInHand: parseFloat(adjustedCash),
      })
      .then((res) => {
        if (res?.status) {
          refetch();
          toast.success(
            data.adjustmentType === "Add Cash"
              ? "Cash amount Increased!"
              : "Cash amount Reduced!"
          );
          closeModal();
        }
      })
      .finally(() => setIsSaving(false));
  };

  const handleSave = async () => {
    // 1. Client-side validation
    const parsedAmount = parseFloat(amount);
    if (!amount || parsedAmount <= 0) {
      setStatusMessage({
        text: "Please enter a valid amount greater than zero.",
        type: "error",
      });
      return;
    }

    // Clear previous messages and set saving state
    setIsSaving(true);
    setStatusMessage({ text: "", type: "" });

    const adjustmentData = {
      adjustmentType,
      amount: parsedAmount,
      adjustmentDate,
      description,
      cashInHand: data?.cashInHand,
    };

    if (isEdit) {
      client_api
        .update(
          `/api/cashadjustment/edit-transaction?userId=${session?.user?.id}&id=${updateId}`,
          "token",
          adjustmentData
        )
        .then((res) => {
          if (res?.status) {
            refetch();
            toast.success("Transaction Edited With Cash Money.");
            closeModal();
          }
        })
        .finally(() => setIsSaving(false));
    } else {
      // Make Transaction
      mockApiSave(adjustmentData);
    }
  };

  const handleEdit = (item) => {
    setAdjustmentDate(item?.date.slice(0, 10));
    setAmount(item?.amount);
    setUpdateAmount(item?.amount);
    setDescription(item?.description);
    setAdjustmentType(item?.type);
    setUpdateId(item?.id);
    openModal();
    setIsEdit(true);
  };

  // Format transaction data for the TransactionsTable
  const formatTransactionData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.map((item) => {
      // Determine if amount should be positive or negative based on transaction type
      let amount = item.amount || 0;

      // Adjust amount sign based on transaction type
      if (
        item.type === "Reduce Cash" ||
        item.type === "Expense" ||
        item.type === "Purchase" || 
        item.type === "LOAN_PROCESSING_FEE" ||
        item.type === "LOAN_PAYMENT" 
      ) {
        amount = -Math.abs(amount); // Make negative
      } else if (
        item.type === "Add Cash" ||
        item.type === "Income" ||
        item.type === "Sale"
      ) {
        amount = Math.abs(amount); // Make positive (already positive, but just to be sure)
      }
      return {
        ...item,
        id: item.id,
        date: item.date || item.createdAt,
        type: item.type || "Adjustment",
        amount: amount, // This now has proper sign
        // Include other fields as needed
      };
    });
  };

  const formattedTransactionData = formatTransactionData(
    data?.transaction || []
  );

  const messageClasses =
    statusMessage.type === "error"
      ? "bg-red-100 border-red-500 text-red-700"
      : "bg-green-100 border-green-500 text-green-700";

  if (isInitialLoading) {
    return <Loading />;
  }
  return (
    <div className="p-2 sm:p-4 md:p-6">
      {!data?.createdAt && (
        <CashSection
          openModal={openModal}
          currencySymbol={currencySymbol}
          currentCash={currentCash}
        />
      )}
      {data?.createdAt && (
        <div>
          <CashInHandSection
            initialCash={currentCash}
            setIsModalOpen={setIsModalOpen}
          />
          <TransactionsTable
            onEditOfCash={handleEdit}
            data={formattedTransactionData}
            invoiceType="cash-adjustment"
            refetch={refetch}
            title="Cash Transactions"
            showSearch={true}
            showFilters={true}
            itemsPerPage={10}
            showPagination={true}
            userProvidedColumns={[
              {
                key: "date",
                label: "Date",
                type: "date",
                sortable: true,
                className: "text-left",
              },
              {
                key: "description",
                label: "Description",
                sortable: true,
                className: "text-left",
              },
              {
                key: "type",
                label: "Type",
                sortable: true,
                className: "text-left",
                type: "badge",
                badgeColor: "bg-blue-100 text-blue-800",
              },
              {
                key: "amount",
                label: "Amount",
                sortable: true,
                className: "text-left font-semibold",
                type: "currency_with_sign",
              },
            ]}
            customRenderers={{
              type: (value) => {
                let badgeColor = "bg-blue-100 text-blue-800";
                if (value === "Add Cash") {
                  badgeColor = "bg-green-100 text-green-800";
                } else if (value === "Reduce Cash") {
                  badgeColor = "bg-red-100 text-red-800";
                }
                return (
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
                  >
                    {value || "Adjustment"}
                  </span>
                );
              },
              date: (value) => {
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } catch (e) {
                  return value || "N/A";
                }
              },
            }}
            size="medium"
          />
        </div>
      )}
      <div className="flex flex-col items-center justify-center p-8 font-sans">
        {/* The Modal Component with form elements matching the image */}
        <CashAdjustmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={isSaving}
          title="Adjust Cash"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Status Message Area */}
            {statusMessage.text && (
              <div
                className={`mb-4 p-3 border-l-4 rounded-md ${messageClasses}`}
              >
                <p className="text-sm font-medium">{statusMessage.text}</p>
              </div>
            )}

            {/* Radio Buttons for Adjustment Type */}
            <div className="flex space-x-6 mb-6">
              {["Add Cash", "Reduce Cash"].map((type) => (
                <label
                  key={type}
                  className="flex items-center text-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="adjustmentType"
                    value={type}
                    checked={adjustmentType === type}
                    onChange={() => setAdjustmentType(type)}
                    className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500 rounded-full"
                  />
                  <span className="ml-2 font-medium">{type}</span>
                </label>
              ))}
            </div>

            {/* Enter Amount */}
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Amount<span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-semibold">
                    {currencySymbol}
                  </span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 transition duration-150"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Updated Cash Display */}
            <p className="text-sm text-gray-700 mb-6">
              Your Cash:{" "}
              <span className="font-semibold">
                {currentCash} {currencySymbol}
              </span>
            </p>

            {/* Adjustment Date */}
            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adjustment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={adjustmentDate}
                  onChange={(e) => setAdjustmentDate(e.target.value)}
                  className="block w-full pr-10 pl-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 transition duration-150 appearance-none"
                  disabled={isSaving}
                />
                {/* Calendar Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full py-3 pl-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 transition duration-150"
                placeholder="Enter Description"
                disabled={isSaving}
              />
            </div>
          </form>
        </CashAdjustmentModal>
      </div>
    </div>
  );
};

export default Page;
