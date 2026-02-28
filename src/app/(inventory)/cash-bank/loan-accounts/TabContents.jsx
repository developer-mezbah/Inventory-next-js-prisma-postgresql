import { useState, useEffect } from "react";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import PaymentSection from "./PaymentSection";
import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { BiLoader } from "react-icons/bi";
import { useSearchParams } from "next/navigation";
import CustomDatePicker from "@/components/DatePicker";

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
  const searchParams = useSearchParams();

  const [showMakePaymentModal, setShowMakePaymentModal] = useState(false);
  const [showTakeLoanModal, setShowTakeLoanModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [paymentPaidFrom, setPaymentPaidFrom] = useState("Cash");
  const [takeLoanReceivedIn, setTakeLoanReceivedIn] = useState("Cash");
  const [chargesPaidFrom, setChargesPaidFrom] = useState("Cash");
  const { currencySymbol, formatPrice } = useCurrencyStore();
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [takeLoanId, setTakeLoanId] = useState(null);
  const [chargesId, setChargesId] = useState(null);

  // Modal state for Make Payment
  const [makePaymentData, setMakePaymentData] = useState({
    principalAmount: "0",
    interestAmount: "0",
    totalAmount: "0",
    date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    paymentType: "Cash"
  });

  // Modal state for Take More Loan
  const [takeLoanData, setTakeLoanData] = useState({
    increaseLoanBy: "0",
    date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    loanReceivedIn: "Cash"
  });

  // Modal state for Charges on Loan
  const [chargesData, setChargesData] = useState({
    amount: "0",
    transactionTypeName: "",
    date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    paidFrom: "Cash"
  });

  // Check for URL parameters
  useEffect(() => {
    const makepaymentParam = searchParams.get('makepayment');
    const paymentIdParam = searchParams.get('paymentId');
    const takeloanParam = searchParams.get('takeloan');
    const takeloanIdParam = searchParams.get('takeloanId');
    const chargesParam = searchParams.get('charges');
    const chargesIdParam = searchParams.get('chargesId');

    if (makepaymentParam === 'update' && paymentIdParam) {
      setPaymentId(paymentIdParam);
      fetchPaymentData(paymentIdParam);
      setShowMakePaymentModal(true);
    }

    if (takeloanParam === 'update' && takeloanIdParam) {
      setTakeLoanId(takeloanIdParam);
      fetchTakeLoanData(takeloanIdParam);
      setShowTakeLoanModal(true);
    }

    if (chargesParam === 'update' && chargesIdParam) {
      setChargesId(chargesIdParam);
      fetchChargesData(chargesIdParam);
      setShowChargesModal(true);
    }
  }, [searchParams]);

  // Function to remove parameters from URL
  const removeUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('makepayment');
    url.searchParams.delete('paymentId');
    url.searchParams.delete('takeloan');
    url.searchParams.delete('takeloanId');
    url.searchParams.delete('charges');
    url.searchParams.delete('chargesId');
    window.history.replaceState({}, '', url.toString());
  };

  // Fetch payment data for update
  const fetchPaymentData = async (id) => {
    const findingPayment = transaction.find(t => t.id === id);
    const match = findingPayment?.description?.match(/Interest:\s*(\d+)/);
    const interestAmount = match ? match[1] : null;

    setMakePaymentData({
      principalAmount: parseFloat(findingPayment.amount) || 0,
      interestAmount: parseFloat(interestAmount) || 0,
      totalAmount: (parseFloat(findingPayment.amount) || 0) + (parseFloat(interestAmount) || 0),
      date: findingPayment?.date ? new Date(findingPayment.date).toISOString().split('T')[0] : new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      paymentType: findingPayment.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingPayment.cashAndBankId)?.accountdisplayname || "Cash"
    });

    setPaymentPaidFrom(findingPayment.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingPayment.cashAndBankId) || "Cash");
  };

  // Fetch take loan data for update
  const fetchTakeLoanData = async (id) => {
    const findingTakeLoan = transaction.find(t => t.id === id);

    setTakeLoanData({
      increaseLoanBy: parseFloat(findingTakeLoan.amount) || "0",
      date: findingTakeLoan?.date ? new Date(findingTakeLoan.date).toISOString().split('T')[0] : new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      loanReceivedIn: findingTakeLoan.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingTakeLoan.cashAndBankId)?.accountdisplayname || "Cash"
    });

    setTakeLoanReceivedIn(findingTakeLoan.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingTakeLoan.cashAndBankId) || "Cash");
  };

  // Fetch charges data for update
  const fetchChargesData = async (id) => {
    const findingCharges = transaction.find(t => t.id === id);

    setChargesData({
      amount: Math.abs(parseFloat(findingCharges.amount)) || 0,
      transactionTypeName: findingCharges.description || "",
      date: findingCharges?.date ? new Date(findingCharges.date).toISOString().split('T')[0] : new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      paidFrom: findingCharges.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingCharges.cashAndBankId)?.accountdisplayname || "Cash"
    });

    setChargesPaidFrom(findingCharges.paymentType === "CASH" ? "Cash" : data?.bank.find(b => b.id === findingCharges.cashAndBankId) || "Cash");
  };

  const chargesRef = useOutsideClick(() => {
    setShowChargesModal(false);
    removeUrlParams();
    setChargesId(null);
  });

  const takeloanRef = useOutsideClick(() => {
    setShowTakeLoanModal(false);
    removeUrlParams();
    setTakeLoanId(null);
  });

  const makepaymentRef = useOutsideClick(() => {
    setShowMakePaymentModal(false);
    removeUrlParams();
    setPaymentId(null);
  });

  const { data: session } = useSession();

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

  useEffect(() => {
    calculateTotalAmount();
  }, [makePaymentData.principalAmount, makePaymentData.interestAmount]);

  // Handle Make Payment form changes
  const handleMakePaymentChange = (e) => {
    const { name, value } = e.target;
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

  // Save Make Payment
  const handleSaveMakePayment = () => {
    if (makePaymentData.totalAmount === "0") {
      toast.error("Total amount cannot be zero");
      return;
    }
    if (parseFloat(makePaymentData.totalAmount) > currentBalance) {
      toast.error("Total payment cannot exceed current balance");
      return;
    }

    setLoading(true);

    const paymentPayload = {
      accountId: accountData.id,
      principalAmount: parseFloat(makePaymentData.principalAmount) || 0,
      interestAmount: parseFloat(makePaymentData.interestAmount) || 0,
      totalAmount: parseFloat(makePaymentData.totalAmount) || 0,
      date: makePaymentData.date || "",
      paymentType: paymentPaidFrom,
      userId: session?.user?.id || null,
      paymentId: paymentId || null,
      mode: paymentId ? "update" : "create"
    };

    const apiCall = client_api.update("/api/loan-accounts/make-payment", "", paymentPayload);

    apiCall.then(response => {
      setShowMakePaymentModal(false);
      removeUrlParams();
      setPaymentId(null);
      refetch();

      setMakePaymentData({
        principalAmount: "0",
        interestAmount: "0",
        totalAmount: "0",
        date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        paymentType: "Cash"
      });
      setPaymentPaidFrom("Cash");
      setLoading(false);

      toast.success(paymentId ? "Payment updated successfully" : "Payment made successfully");
    }).catch(error => {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment. Please try again.");
      setLoading(false);
    });
  };

  // Save Take Loan
  const handleSaveTakeLoan = () => {
    if (takeLoanData.increaseLoanBy === "0" || !takeLoanData.increaseLoanBy) {
      toast.error("Loan amount cannot be zero");
      return;
    }

    setLoading(true);

    const takeLoanPayload = {
      accountId: accountData.id,
      amount: parseFloat(takeLoanData.increaseLoanBy) || 0,
      date: takeLoanData.date || "",
      paymentType: takeLoanReceivedIn,
      userId: session?.user?.id || null,
      takeLoanId: takeLoanId || null,
      mode: takeLoanId ? "update" : "create"
    };

    const apiCall = client_api.update("/api/loan-accounts/take-more-loan", "", takeLoanPayload);

    apiCall.then(response => {
      setShowTakeLoanModal(false);
      removeUrlParams();
      setTakeLoanId(null);
      refetch();

      setTakeLoanData({
        increaseLoanBy: "0",
        date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        loanReceivedIn: "Cash"
      });
      setTakeLoanReceivedIn("Cash");
      setLoading(false);

      toast.success(takeLoanId ? "Loan updated successfully" : "Loan taken successfully");
    }).catch(error => {
      console.error("Error saving loan:", error);
      toast.error("Failed to save loan. Please try again.");
      setLoading(false);
    });
  };

  // Save Charges
  const handleSaveCharges = () => {
    if (chargesData.amount === "0" || !chargesData.amount) {
      toast.error("Amount cannot be zero");
      return;
    }

    if (parseFloat(chargesData.amount) > currentBalance) {
      toast.error("Charges amount cannot exceed current balance");
      return;
    }

    if (!chargesData.transactionTypeName.trim()) {
      toast.error("Please enter transaction type name");
      return;
    }

    setLoading(true);

    const chargesPayload = {
      accountId: accountData.id,
      amount: parseFloat(chargesData.amount) || 0,
      chargeType: chargesData.transactionTypeName,
      date: chargesData.date || "",
      paymentType: chargesPaidFrom,
      userId: session?.user?.id || null,
      chargesId: chargesId || null,
      mode: chargesId ? "update" : "create"
    };

    const apiCall = client_api.update("/api/loan-accounts/charges", "", chargesPayload);

    apiCall.then(response => {
      setShowChargesModal(false);
      removeUrlParams();
      setChargesId(null);
      refetch();

      setChargesData({
        amount: "0",
        transactionTypeName: "",
        date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        paidFrom: "Cash"
      });
      setChargesPaidFrom("Cash");
      setLoading(false);

      toast.success(chargesId ? "Charges updated successfully" : "Charges added successfully");
    }).catch(error => {
      console.error("Error saving charges:", error);
      toast.error("Failed to save charges. Please try again.");
      setLoading(false);
    });
  };

  // Reset form when modal is closed without saving
  const handleCloseMakePaymentModal = () => {
    setShowMakePaymentModal(false);
    removeUrlParams();
    setPaymentId(null);
    setMakePaymentData({
      principalAmount: "0",
      interestAmount: "0",
      totalAmount: "0",
      date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      paymentType: "Cash"
    });
    setPaymentPaidFrom("Cash");
  };

  const handleCloseTakeLoanModal = () => {
    setShowTakeLoanModal(false);
    removeUrlParams();
    setTakeLoanId(null);
    setTakeLoanData({
      increaseLoanBy: "0",
      date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      loanReceivedIn: "Cash"
    });
    setTakeLoanReceivedIn("Cash");
  };

  const handleCloseChargesModal = () => {
    setShowChargesModal(false);
    removeUrlParams();
    setChargesId(null);
    setChargesData({
      amount: "0",
      transactionTypeName: "",
      date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      paidFrom: "Cash"
    });
    setChargesPaidFrom("Cash");
  };

  // Get account data
  const accountName = accountData?.accountName || "";
  const currentBalance = accountData?.currentBalance || 0;
  const processingFee = accountData?.processingFee || 0;
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
                {/* Current Balance Section */}
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Balance Amount</div>
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

          {/* Current Balance Stacked */}
          <div>
            <div className="text-sm text-gray-500 font-medium">Balance Amount</div>
            <div className="text-lg font-bold text-gray-800">{formatPrice(currentBalance)}</div>
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
              onClick={() => setShowChargesModal(true)}
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
            let displayType = t.type;
            let displayPaymentType = t.paymentType || "N/A";
            let displayAmount = t.amount || 0;
            let transactionDate = t.date ? new Date(t.date).toLocaleDateString() : "N/A";

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
              <h2 className="text-xl font-bold text-gray-800">
                {paymentId ? 'Update Payment' : 'Make Payment'} - {accountName}
              </h2>
              <button
                onClick={handleCloseMakePaymentModal}
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
                <CustomDatePicker
                  defaultValue={makePaymentData.date}
                  size="large"
                  label="Date"
                  onChange={(date) => setMakePaymentData(prev => ({ ...prev, date: date }))}
                  icon="calendar"
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
                onClick={handleCloseMakePaymentModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleSaveMakePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
              >
                {loading ? (
                  <span className="flex items-center">
                    <BiLoader className="mr-2 animate-spin" />
                    {paymentId ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (
                  paymentId ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take More Loan Modal */}
      {showTakeLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={takeloanRef} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{accountName}</h2>
                <h3 className="text-xl font-bold text-gray-800">
                  {takeLoanId ? 'Update Loan' : 'Take More Loan'}
                </h3>
              </div>
              <button
                onClick={handleCloseTakeLoanModal}
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
                <CustomDatePicker
                  defaultValue={takeLoanData.date}
                  size="large"
                  label="Date"
                  onChange={(date) => setTakeLoanData(prev => ({ ...prev, date: date }))}
                  icon="calendar"
                />
              </div>

              <div>
                <PaymentSection
                  refetch={refetch}
                  bankData={data?.bank || []}
                  cashData={data?.cash || []}
                  paymentType={takeLoanReceivedIn}
                  onPaymentTypeChange={setTakeLoanReceivedIn}
                  title="Loan Received In"
                  compact={true}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseTakeLoanModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleSaveTakeLoan}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition duration-150 flex items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <BiLoader className="mr-2 animate-spin" />
                    {takeLoanId ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (
                  takeLoanId ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charges on Loan Modal */}
      {showChargesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={chargesRef} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {chargesId ? 'Update Charges' : 'Charges On Loan'} - {accountName}
              </h2>
              <button
                onClick={handleCloseChargesModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount*
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

                <CustomDatePicker
                  defaultValue={chargesData.date}
                  size="large"
                  label="Date"
                  onChange={(date) => setChargesData(prev => ({ ...prev, date: date }))}
                  icon="calendar"
                />
              </div>

              <div>
                <PaymentSection
                  refetch={refetch}
                  bankData={data?.bank || []}
                  cashData={data?.cash || []}
                  paymentType={chargesPaidFrom}
                  onPaymentTypeChange={setChargesPaidFrom}
                  title="Paid From"
                  compact={true}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseChargesModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleSaveCharges}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 flex items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <BiLoader className="mr-2 animate-spin" />
                    {chargesId ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (
                  chargesId ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabContents;