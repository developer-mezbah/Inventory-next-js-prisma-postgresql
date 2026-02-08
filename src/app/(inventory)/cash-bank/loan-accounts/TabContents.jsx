import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { FaRegEdit } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
// import TransactionsTable from './TransactionsTable';

const TimeNotificationIcon = (props) => {
  const { size = 24, color = "currentColor", ...rest } = props;

  // Colors inspired by the uploaded image
  const outerStrokeColor = "#f59e0b"; // Amber 500
  const clockFillColor = "#ffffff";
  const handColor = "#3b88c7"; // Sky Blue 600
  const badgeColor = "#ef4444"; // Red 500

  // Standard 24x24 viewBox for easy sizing
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      {...rest}
    >
      {/* 1. Outer Orange/Yellow Clock Border */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={outerStrokeColor}
        strokeWidth="1.5"
        fill={clockFillColor}
      />

      {/* 2. Clock Hands (Indicating a time, e.g., 1 o'clock) */}
      {/* Hour hand - thicker and shorter */}
      <line
        x1="12"
        y1="12"
        x2="13.5"
        y2="7"
        stroke={handColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Minute hand - thinner and longer */}
      <line
        x1="12"
        y1="12"
        x2="15"
        y2="10.5"
        stroke={handColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx="12" cy="12" r="0.8" fill={handColor} />

      {/* 3. The Red Notification Badge */}
      {/* Positioned near the top-right edge of the 24x24 viewBox */}
      <circle
        cx="18"
        cy="6"
        r="3"
        fill={badgeColor}
        stroke={clockFillColor} // Add a slight white border for separation/pop
        strokeWidth="0.5"
      />
    </svg>
  );
};

const TabContents = ({ partyName, phoneNumber, transaction, refetch }) => {
  return (
    <div className="font-inter antialiased">
      {/* Main Card Container */}
      <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
        {/* Header Section */}
        <div className="hidden md:block">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              {/* Title and Link Icon (Left Side) */}
              <div className="flex items-center text-lg font-semibold text-gray-800">
                <span className="mr-1">{partyName}</span>
                <FaRegEdit className="w-5 h-5 ml-1 text-blue-600 cursor-pointer hover:text-blue-700 transition duration-150" />
              </div>

              {/* Action/Status Icons (Right Side) */}
              <div className="flex space-x-2 items-center">
                <button>
                  <RiWhatsappFill className="text-green-500 text-[28px]" />
                </button>
                <button>
                  <TimeNotificationIcon size={25} className="text-gray-900" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section - Phone Number Detail */}
          <div className="p-4 space-y-3 bg-white">
            {/* Phone Number Label */}
            <div className="text-sm font-medium text-gray-500">
              Phone Number
            </div>
            {/* Phone Number Value */}
            <div className="text-xl font-bold text-gray-800 -mt-1">
              {phoneNumber}
            </div>
          </div>
        </div>

        {/* Subtle Bottom Border (Matching the bottom line in the image) */}
        <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
        {/* <TransactionsTable transaction={transaction} /> */}
        <TransactionsTable
          //   columnOrder={["type", "amount"]}
          data={transaction.map((t) => {
            const originalAmount = t.totalAmount;
            const balanceDue = t.balanceDue;

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
              id: t.id,
              transactionId: t.transactionId,
              amount: t.totalAmount,
              transactionType: t.type,
              purchaseId: t.purchaseId,
              saleId: t.saleId,
              type: t?.type,
              paymentType: t?.paymentType,
            };
          })}
          itemsPerPage={10}
          refetch={refetch}
          showPagination={true}
          userProvidedColumns={[
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
          ]}
        />
      </div>
    </div>
  );
};

export default TabContents;
