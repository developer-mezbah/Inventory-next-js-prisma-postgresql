import { useState, useEffect } from "react";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import PaymentSection from "./PaymentSection";
import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";

const TimeNotificationIcon = (props) => {
  const { size = 24, color = "currentColor", ...rest } = props;

  const outerStrokeColor = "#f59e0b";
  const clockFillColor = "#ffffff";
  const handColor = "#3b88c7";
  const badgeColor = "#ef4444";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      {...rest}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={outerStrokeColor}
        strokeWidth="1.5"
        fill={clockFillColor}
      />
      <line
        x1="12"
        y1="12"
        x2="13.5"
        y2="7"
        stroke={handColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="12"
        x2="15"
        y2="10.5"
        stroke={handColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="0.8" fill={handColor} />
      <circle
        cx="18"
        cy="6"
        r="3"
        fill={badgeColor}
        stroke={clockFillColor}
        strokeWidth="0.5"
      />
    </svg>
  );
};

const TabContents = ({ transaction = [], refetch, accountData, data }) => {

  const [showMakePaymentModal, setShowMakePaymentModal] = useState(false);
  const [showTakeLoanModal, setShowTakeLoanModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [paymentPaidFrom, setPaymentPaidFrom] = useState("Cash");
  const { currencySymbol, formatPrice } = useCurrencyStore();

  // Modal state for Make Payment
  const [makePaymentData, setMakePaymentData] = useState({
    principalAmount: "0",
    interestAmount: "0",
    totalAmount: "0",
    date: new Date().toLocaleDateString('en-GB')
  });

  // Modal state for Take More Loan
  const [takeLoanData, setTakeLoanData] = useState({
    increaseLoanBy: "0",
    date: new Date().toLocaleDateString('en-GB'),
    loanReceivedIn: "Cash"
  });

  // Modal state for Charges on Loan
  const [chargesData, setChargesData] = useState({
    amount: "0",
    transactionTypeName: "",
    date: new Date().toLocaleDateString('en-GB'),
    loanReceivedIn: "Cash"
  });

  const chargesRef = useOutsideClick(() => setShowChargesModal(false));
  const takeloanRef = useOutsideClick(() => setShowTakeLoanModal(false));
  const makepaymentRef = useOutsideClick(() => setShowMakePaymentModal(false));

  const { data: session } = useSession()

  // Calculate total amount when principal or interest changes
  const calculateTotalAmount = () => {
    const principal = parseFloat(makePaymentData.principalAmount) || 0;
    const interest = parseFloat(makePaymentData.interestAmount) || 0;
    const total = principal + interest;

    setMakePaymentData(prev => ({
      ...prev,
      totalAmount: total.toString()
    }));
  };

  // Calculate total when principalAmount or interestAmount changes
  useEffect(() => {
    calculateTotalAmount();
  }, [makePaymentData.principalAmount, makePaymentData.interestAmount]);

  // Handle Make Payment form changes
  const handleMakePaymentChange = (e) => {
    const { name, value } = e.target;

    // Parse the value to ensure it's a number, but keep as string for input
    const parsedValue = value === "" ? "0" : value;

    setMakePaymentData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // Handle Take Loan form changes
  const handleTakeLoanChange = (e) => {
    const { name, value } = e.target;
    setTakeLoanData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Charges form changes
  const handleChargesChange = (e) => {
    const { name, value } = e.target;
    setChargesData(prev => ({ ...prev, [name]: value }));
  };

  // Save handlers
  const handleSaveMakePayment = () => {
    console.log("Make Payment Data:", makePaymentData, paymentPaidFrom);

    client_api.update("/api/loan-accounts/make-payment","", {
      accountId: accountData.id,
      principalAmount: parseFloat(makePaymentData.principalAmount) || 0,
      interestAmount: parseFloat(makePaymentData.interestAmount) || 0,
      totalAmount: parseFloat(makePaymentData.totalAmount) || 0,
      date: makePaymentData.date,
      paymentType: paymentPaidFrom,
      userId: session?.user?.id || null, // Pass userId for cash payments
    }).then(response => {
      console.log("Payment successful:", response);
      setShowMakePaymentModal(false);
      refetch();
    }).catch(error => {
      console.error("Error making payment:", error);
      // Optionally show an error message to the user
    });
  };

  const handleSaveTakeLoan = () => {
    console.log("Take Loan Data:", takeLoanData);
    // Add your API call here
    setShowTakeLoanModal(false);
  };

  const handleSaveCharges = () => {
    console.log("Charges Data:", chargesData);
    // Add your API call here
    setShowChargesModal(false);
  };

  // Get account name
  const accountName = accountData?.accountName || "";

  // Get current balance from account data
  const currentBalance = accountData?.currentBalance || 0;

  // Calculate total amount from transactions
  const totalLoanAmount = transaction.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Get processing fee
  const processingFee = accountData?.processingFee || 0;

  // Get loan received method
  const loanReceivedIn = accountData?.loanReceivedIn || "Cash";

  return (
    <div className="font-inter antialiased">
      {/* Main Card Container */}
      <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
        {/* Header Section - Updated Design */}
        <div className="hidden md:block">
          <div className="p-4 border-b border-gray-200 bg-white">
            {/* Main Header Row */}
            <div className="flex justify-between items-center mb-3">
              {/* Left Side: Party Name with Edit Icon */}
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-800 mr-2">
                  {accountName}
                </h2>
                <FaRegEdit className="w-4 h-4 text-blue-600 cursor-pointer" />
              </div>

              {/* Right Side: Total Loan and Current Balance */}
              <div className="flex items-center space-x-6">
                {/* Total Loan Amount Section */}
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Total Loan</div>
                  <div className="text-lg font-bold text-gray-800">{formatPrice(totalLoanAmount)}</div>
                </div>

                {/* Current Balance Section */}
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Current Balance</div>
                  <div className="text-lg font-bold text-gray-800">{formatPrice(currentBalance)}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-between items-center">
              {/* Left Side: Loan Details */}
              <div>
                <div className="text-sm font-medium text-gray-500">Loan Details</div>
                <div className="text-lg font-bold text-gray-800">
                  {loanReceivedIn} • Processing Fee: {formatPrice(processingFee)}
                </div>
              </div>

              {/* Right Side: Action Buttons and Icons */}
              <div className="flex items-center space-x-4">
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMakePaymentModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-150"
                  >
                    Make Payment
                  </button>
                  <button
                    onClick={() => setShowTakeLoanModal(true)}
                    className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition duration-150"
                  >
                    Take more loan
                  </button>
                  <button
                    onClick={() => setShowChargesModal(true)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-150"
                  >
                    Charges on Loan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 border-b border-gray-200 bg-white">
          {/* Top Row: Party Name and Icons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800 mr-2">
                {accountName}
              </h2>
              <FaRegEdit className="w-4 h-4 text-blue-600 cursor-pointer" />
            </div>
            <div className="flex items-center space-x-2">
              <button>
                <RiWhatsappFill className="text-green-500 text-2xl" />
              </button>
              <button>
                <TimeNotificationIcon size={22} className="text-gray-900" />
              </button>
            </div>
          </div>

          {/* Total Loan and Current Balance Stacked */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500 font-medium">Total Loan</div>
              <div className="text-lg font-bold text-gray-800">{formatPrice(totalLoanAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Current Balance</div>
              <div className="text-lg font-bold text-gray-800">{formatPrice(currentBalance)}</div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500">Loan Details</div>
            <div className="text-lg font-bold text-gray-800">
              {loanReceivedIn} • Processing Fee: {formatPrice(processingFee)}
            </div>
          </div>

          {/* Action Buttons - Stacked on Mobile */}
          <div className="space-y-2">
            <button
              onClick={() => setShowMakePaymentModal(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-150"
            >
              Make Payment
            </button>
            <button
              onClick={() => setShowTakeLoanModal(true)}
              className="w-full px-4 py-3 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition duration-150"
            >
              Take more loan
            </button>
            <button
              onClick={() => setShowChargesModal(false)}
              className="w-full px-4 py-3 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-150"
            >
              Charges on Loan
            </button>
          </div>
        </div>

        {/* Subtle Bottom Border */}
        <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>

        <TransactionsTable
          isMobile={true}
          data={transaction.map((t) => {
            // For loan transactions, we need to handle different fields
            let displayType = t.type;
            let displayPaymentType = t.paymentType || "N/A";
            let displayAmount = t.amount || 0;
            let transactionDate = t.date ? new Date(t.date).toLocaleDateString() : "N/A";

            // Format the transaction type for better display
            if (displayType === "LOAN_DISBURSEMENT") {
              displayType = "Loan Disbursement";
            }

            return {
              id: t.id,
              transactionId: t.transactionId,
              amount: displayAmount,
              transactionType: displayType,
              type: displayType,
              paymentType: displayPaymentType,
              date: transactionDate,
              description: t.description || "No description",
              invoiceNo: t.invoiceNo || "N/A"
            };
          })}
          itemsPerPage={10}
          refetch={refetch}
          showPagination={true}
          userProvidedColumns={[
            {
              key: "date",
              label: "Date",
              sortable: true,
              type: "text",
              className: "text-left font-semibold",
            },
            {
              key: "invoiceNo",
              label: "Invoice No",
              sortable: true,
              type: "text",
              className: "text-left font-semibold",
            },
            {
              key: "type",
              label: "Type",
              sortable: true,
              type: "badge",
              className: "text-left font-semibold",
            },
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
            {
              key: "description",
              label: "Description",
              sortable: true,
              type: "text",
              className: "text-left font-semibold",
            },
          ]}
        />
      </div>

      {/* Make Payment Modal */}
      {showMakePaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={makepaymentRef} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Make Payment - {accountName}</h2>
              <button
                onClick={() => setShowMakePaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount
                </label>
                <input
                  type="number"
                  name="principalAmount"
                  value={makePaymentData.principalAmount}
                  onChange={handleMakePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Amount
                </label>
                <input
                  type="number"
                  name="interestAmount"
                  value={makePaymentData.interestAmount}
                  onChange={handleMakePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={makePaymentData.totalAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={makePaymentData.date}
                  onChange={handleMakePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <PaymentSection
                  refetch={refetch}
                  bankData={data?.bank || []}
                  cashData={data?.cash || []}
                  paymentType={paymentPaidFrom}
                  onPaymentTypeChange={setPaymentPaidFrom}
                  title="Paid From"
                  compact={true}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowMakePaymentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMakePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take More Loan Modal */}
      {showTakeLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={takeloanRef} className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{accountName}</h2>
                <h3 className="text-xl font-bold text-gray-800">Take More Loan</h3>
              </div>
              <button
                onClick={() => setShowTakeLoanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Increase Loan By*
                </label>
                <input
                  type="number"
                  name="increaseLoanBy"
                  value={takeLoanData.increaseLoanBy}
                  onChange={handleTakeLoanChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={takeLoanData.date}
                  onChange={handleTakeLoanChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Received In
                </label>
                <select
                  name="loanReceivedIn"
                  value={takeLoanData.loanReceivedIn}
                  onChange={handleTakeLoanChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Bkash">Bkash</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowTakeLoanModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTakeLoan}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition duration-150"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charges on Loan Modal */}
      {showChargesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={chargesRef} className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Charges On Loan - {accountName}</h2>
              <button
                onClick={() => setShowChargesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={chargesData.amount}
                  onChange={handleChargesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type Name*
                  <span className="text-xs text-gray-500 ml-1">Example: Penalty on Missing EMI</span>
                </label>
                <input
                  type="text"
                  name="transactionTypeName"
                  value={chargesData.transactionTypeName}
                  onChange={handleChargesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter transaction type name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={chargesData.date}
                  onChange={handleChargesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charge Amount
                </label>
                <input
                  type="text"
                  value={chargesData.amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid From
                </label>
                <select
                  name="loanReceivedIn"
                  value={chargesData.loanReceivedIn}
                  onChange={handleChargesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Bkash">Bkash</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowChargesModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCharges}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabContents;