"use client"

import numberToWords from "@/lib/number-to-words"


function calculateTotalDiscount(itemsArray, discount) {
  // Step 1: Calculate the Grand Total using the 'reduce' method
  const grandTotal = itemsArray.reduce((total, item) => {
    return total + item.amount;
  }, 0); // Start total at 0

  // Step 2: Calculate the discount value
  const discountRateDecimal = discount / 100;
  const discountValue = grandTotal * discountRateDecimal;

  // Step 3: Calculate the final price
  const finalPrice = grandTotal - discountValue;

  return {
    grandTotal: grandTotal.toFixed(2),
    discountValue: discountValue.toFixed(2),
    finalPrice: finalPrice.toFixed(2)
  };
}

export default function InvoicePreview({ data }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0)
  const tax = parseFloat((subtotal * (data?.tax / 100)).toFixed(2))
  // const discount = data?.totalAmount * data?.discount || 0 // This line seems to calculate discount incorrectly based on the old logic, keeping the new calculation which is already in use.
  const total = data?.totalAmount
  const isPaid = data?.isPaid // boolean
  const paidAmount = data?.paidAmount || 0 // New Prop for the paid amount
  const balanceDue = data?.balanceDue

  // Logic to determine the status text and color
  const getPaymentStatus = () => {
    if (isPaid) {
      return { text: "PAID", color: "green" }
    } else if (paidAmount > 0 && paidAmount < total) {
      return { text: "PARTIALLY PAID", color: "orange" }
    } else {
      return { text: "UNPAID", color: "red" }
    }
  }
  const paymentStatus = getPaymentStatus()

  const formatCurrency = (amount) => {
    // Ensure amount is treated as a number before formatting
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericAmount)
  }

  const formatDate = (dateString) => {
    // Format the date to "DD/MM/YYYY" or similar style for the new design's date fields
    const date = new Date(dateString)
    const day = date.toLocaleDateString("en-US", { day: "2-digit" })
    const month = date.toLocaleDateString("en-US", { month: "2-digit" })
    const year = date.toLocaleDateString("en-US", { year: "numeric" })
    return { day, month, year }
  }

  const dateParts = data.date ? formatDate(data.date) : { day: "DD", month: "MM", year: "YYYY" }
  const formattedTotalInWords = numberToWords(Math.floor(total))

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "794px",
      height: "1000px",
      position: "relative", overflow: "hidden", boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <div
        className=""
        style={{
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "60px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* --- Header Section (Logo & Company Info) --- */}
        <div
          className="header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "50px",
          }}
        >
          {/* Left: Logo and Invoice Number */}
          <div
            className="logo"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#000",
              letterSpacing: "2px",
              lineHeight: 1.6,
            }}
          >
            <img width="120" src={data?.logoUrl ? data?.logoUrl : "https://res.cloudinary.com/dqxizxsl0/image/upload/v1756406797/KickOnProject/vkig4awmxo6inpb2zm9c.png"} alt="Logo" />

            <p style={{ marginTop: "5px" }}>{data.companyName.toUpperCase() || "YOUR LOGO"}</p>
            <div style={{ marginTop: "40px", display: "flex", gap: "10px", alignItems: "center" }}>
              <div>Sl. No. </div>
              <div style={{ fontWeight: "bold", color: "black", fontSize: "18px" }}>#{data.invoiceNumber}</div>
            </div>
          </div>

          {/* Right: Company Contact Info and Payment Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: paymentStatus.color, // Dynamic color based on status
                border: `2px solid ${paymentStatus.color}`,
                padding: "8px 15px",
                borderRadius: "5px",
                textAlign: "center",
                marginBottom: "20px",
                marginTop: "-40px", // Pulling up to align with the top of the header visually
              }}
            >
              {paymentStatus.text}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <svg style={{ width: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  clipRule="evenodd"
                />
              </svg>
              <div style={{ fontSize: "14px", color: "#333" }}>{data.address}</div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <svg style={{ width: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="m3.855 7.286 1.067-.534a1 1 0 0 0 .542-1.046l-.44-2.858A1 1 0 0 0 4.036 2H3a1 1 0 0 0-1 1v2c0 .709.082 1.4.238 2.062a9.012 9.012 0 0 0 6.7 6.7A9.024 9.024 0 0 0 11 14h2a1 1 0 0 0 1-1v-1.036a1 1 0 0 0-.848-.988l-2.858-.44a1 1 0 0 0-1.046.542l-.534 1.067a7.52 7.52 0 0 1-4.86-4.859Z"
                  clipRule="evenodd"
                />
              </svg>
              <div style={{ fontSize: "14px", color: "#333" }}>{data.phone}</div>
            </div>
            {/* Website is hardcoded in the new design's example, keeping it hardcoded or removing it. Using a placeholder for now. */}
            <div style={{ display: "flex", gap: "4px" }}>
              <svg style={{ width: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM.5 8a7.5 7.5 0 1 0 15 0a7.5 7.5 0 0 0-15 0Zm7.5.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75V8.5a.75.75 0 0 0-1.5 0V8.75H8.5a.75.75 0 0 0 0-.75h-.25v-.25a.75.75 0 0 0-1.5 0v.25H7.5Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.5 1.5c.34 0 .68.04.97.11a5.5 5.5 0 0 1 3.52 3.65c.07.29.11.63.11.97s-.04.68-.11.97a5.5 5.5 0 0 1-3.65 3.52c-.29.07-.63.11-.97.11s-.68-.04-.97-.11a5.5 5.5 0 0 1-3.52-3.65c-.07-.29-.11-.63-.11-.97s.04-.68.11-.97a5.5 5.5 0 0 1 3.65-3.52c.29-.07.63-.11.97-.11Zm-1 1.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <div style={{ fontSize: "14px", color: "#333" }}>{data.website || "https://yourwebsite.com"}</div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <svg style={{ width: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <div style={{ fontSize: "14px", color: "#333" }}>{data.email}</div>
            </div>
          </div>
        </div>

        {/* --- Decorative Waves (SVG background) --- */}
        {/* Top Right Wave */}
        <div
          className="top-right-wave"
          style={{
            position: "absolute",
            top: 0,
            right: "-75px",
            width: "200px",
            height: "200px",
            zIndex: 1,
            opacity: 0.4,
            transform: "rotate(270deg)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssvgjs="http://svgjs.dev/svgjs" width="200" height="200" preserveAspectRatio="none" viewBox="0 0 200 200">
            <defs>
              <mask id="SvgjsMask1205">
                <rect width="200" height="200" fill="#ffffff"></rect>
              </mask>
            </defs>
            <g mask="url(&quot;#SvgjsMask1205&quot;)" fill="none">
              <path d="M 0,124 C 20,110.4 60,58.6 100,56 C 140,53.4 180,100 200,111L200 200L0 200z" fill="rgba(179, 179, 179, 1)"></path>
              <path d="M 0,153 C 20,140.6 60,82.4 100,91 C 140,99.6 180,175 200,196L200 200L0 200z" fill="rgba(37, 37, 37, 1)"></path>
            </g>
          </svg>
        </div>

        {/* Top Left Wave */}
        <div
          className="top-left-wave"
          style={{
            position: "absolute",
            top: 0,
            left: "-75px",
            width: "645px",
            height: "200px",
            zIndex: 1,
            opacity: 0.4,
            transform: "rotate(154deg)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssvgjs="http://svgjs.dev/svgjs" width="700" height="300" preserveAspectRatio="none" viewBox="0 0 700 300">
            <defs>
              <mask id="SvgjsMask1432">
                <rect width="700" height="300" fill="#ffffff"></rect>
              </mask>
            </defs>
            <g mask="url(&quot;#SvgjsMask1432&quot;)" fill="none">
              <path d="M 0,199 C 46.8,170 140.4,53.8 234,54 C 327.6,54.2 374.8,189.2 468,200 C 561.2,210.8 653.6,126.4 700,108L700 300L0 300z" fill="rgba(0, 0, 0, 1)"></path>
              <path d="M 0,247 C 46.8,217.6 140.4,100.6 234,100 C 327.6,99.4 374.8,256 468,244 C 561.2,232 653.6,80.8 700,40L700 300L0 300z" fill="rgba(179, 179, 179, 1)"></path>
            </g>
          </svg>
        </div>
        {/* --- End Decorative Waves --- */}

        {/* --- Bill To & Date --- */}
        <div style={{ padding: "10px 0" }}>
          <div style={{ display: "flex", marginBottom: "15px" }}>
            {/* Bill To Name */}
            <div style={{ display: "flex", gap: "1px", alignItems: "center", marginBottom: "8px", width: "66.67%" }}>
              <h4 style={{ margin: 0, fontWeight: "normal", fontSize: "16px" }}>Name :</h4>
              <div style={{ borderBottom: "2px dotted gray", textAlign: "center", width: "80%", paddingBottom: "2px", fontWeight: "bold", fontSize: "16px" }}>
                {data.billTo}
              </div>
            </div>
            {/* Bill To Phone (Approximation) - new design only has one name field and one phone field */}
            <div style={{ display: "flex", gap: "1px", alignItems: "center", marginBottom: "8px", width: "33.33%" }}>
              <h4 style={{ whiteSpace: "nowrap", margin: 0, fontWeight: "normal", fontSize: "16px" }}>Mobile NO :</h4>
              <div style={{ borderBottom: "2px dotted gray", textAlign: "center", width: "60%", paddingBottom: "2px", fontWeight: "bold", fontSize: "16px" }}>
                {data.billToPhone || "N/A"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", marginBottom: "15px" }}>
            {/* Bill To Address (Approximation) */}
            <div style={{ display: "flex", gap: "1px", alignItems: "center", marginBottom: "8px", width: "66.67%" }}>
              <h4 style={{ margin: 0, fontWeight: "normal", fontSize: "16px" }}>Address :</h4>
              <div style={{ borderBottom: "2px dotted gray", textAlign: "center", width: "80%", paddingBottom: "2px", fontWeight: "bold", fontSize: "16px" }}>
                {data.billToAddress || data.billToEmail}
              </div>
            </div>
            {/* Date */}
            <div style={{ display: "flex", gap: "1px", alignItems: "center", marginBottom: "8px", width: "33.33%" }}>
              <h4 style={{ whiteSpace: "nowrap", margin: 0, fontWeight: "normal", fontSize: "16px" }}>Date : </h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "200px",
                  padding: "5px",
                  border: "1px solid #ccc",
                  alignItems: "center",
                  marginLeft: "5px",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              >
                <div style={{ textAlign: "center", width: "30%", fontWeight: "bold", color: "#333" }}>{dateParts.day}</div>
                <div style={{ borderBottom: "2px dotted gray", width: "5%", margin: "0 5px", height: "10px" }}></div>
                <div style={{ textAlign: "center", width: "30%", fontWeight: "bold", color: "#333" }}>{dateParts.month}</div>
                <div style={{ borderBottom: "2px dotted gray", width: "5%", margin: "0 5px", height: "10px" }}></div>
                <div style={{ textAlign: "center", width: "30%", fontWeight: "bold", color: "#333" }}>{dateParts.year}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Items Table --- */}
        <div className="table-section" style={{ marginBottom: "40px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead style={{ backgroundColor: "#e8e8e8" }}>
              <tr>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: 600, color: "#000" }}>Description</th>
                <th style={{ padding: "14px 12px", textAlign: "right", fontWeight: 600, color: "#000" }}>Quantity</th>
                <th style={{ padding: "14px 12px", textAlign: "right", fontWeight: 600, color: "#000" }}>Rate</th>
                <th style={{ padding: "14px 12px", textAlign: "right", fontWeight: 600, color: "#000" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="item-name" style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0", color: "#000" }}>
                    {item.description}
                  </td>
                  <td className="quantity-cell" style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0", color: "#333", textAlign: "right" }}>
                    {item.quantity}
                  </td>
                  <td className="price-cell" style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0", color: "#333", textAlign: "right" }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="amount-cell" style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Row for Subtotal */}
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>Subtotal:</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>
                  {formatCurrency(subtotal)}
                </td>
              </tr>
              {/* Row for Tax (10%) */}
              {data?.tax > 0 && <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>Tax ({data?.tax}%):</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>
                  +{tax}
                </td>
              </tr>}
              {data?.discount > 0 && <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>Discount ({data?.discount}%):</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>
                  -{calculateTotalDiscount(data.items, data.discount).discountValue}
                </td>
              </tr>}
              {/* NEW: Row for Paid Amount */}
              {paidAmount > 0 && <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}></td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#000", fontWeight: 600, textAlign: "right" }}>Paid Amount:</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "green", fontWeight: 600, textAlign: "right" }}>
                  {formatCurrency(paidAmount)}
                </td>
              </tr>}
            </tbody>
          </table>
        </div>

        {/* --- Total Row --- */}
        <div
          className="total-row"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "40px",
            marginBottom: "15px", // Reduced margin to fit Balance Due below
            fontSize: "16px",
            borderBottom: "2px solid #e8e8e8",
            padding: "20px 0 10px 0",
            borderTop: "2px solid #e8e8e8", // Added top border to separate from table lines
          }}
        >
          <div className="total-label" style={{ fontWeight: 700, color: "#000", minWidth: "100px", textAlign: "right" }}>
            Total
          </div>
          <div className="total-amount" style={{ fontWeight: 700, color: "#000", minWidth: "100px", textAlign: "right" }}>
            {formatCurrency(data?.totalAmount)}
          </div>
        </div>

        {/* NEW: Balance Due Row */}
        <div
          className="balance-due-row"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "40px",
            marginBottom: "30px",
            fontSize: "18px",
            padding: "10px 0",
            borderBottom: "2px solid #000", // Stronger border to highlight the final amount
          }}
        >
          <div className="balance-due-label" style={{ fontWeight: 800, color: "#000", minWidth: "100px", textAlign: "right" }}>
            Balance Due
          </div>
          <div className="balance-due-amount" style={{ fontWeight: 800, color: balanceDue > 0 ? "red" : "green", minWidth: "100px", textAlign: "right" }}>
            {formatCurrency(balanceDue)}
          </div>
        </div>

        {/* --- Amount in Words, Payment Note, and Terms --- */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
          {/* Amount in Words (Left Side - takes more space) */}
          <div style={{ flex: 2, paddingRight: "20px" }}>
            <span className="payment-label" style={{ fontWeight: 700, color: "#000", display: "block", marginBottom: "8px" }}>
              Amount in Words:
            </span>
            <div style={{ color: "#333", fontStyle: "italic", fontSize: "14px", lineHeight: "1.5" }}>
              {formattedTotalInWords} only
            </div>
           {data?.signatureUrl && (
  <div className="flex flex-col items-center mt-8 mx-auto w-fit min-w-[200px] max-w-[280px]">
    {/* Signature image container */}
    <div className="relative w-full h-[60px] flex items-end justify-center pb-1">
      <img
        src={data.signatureUrl}
        alt="Authorized Signature"
        className="block max-h-full max-w-full object-contain"
        // Recommended: Add an onError handler for production reliability
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'https://placehold.co/150x40/FFFFFF/000?text=Sign+Here'; // Larger placeholder
        }}
      />
    </div>
    
    {/* The horizontal line and the label text */}
    <div className="w-full border-t border-gray-400 pt-1 mt-1"> {/* Increased pt-1 for more space */}
      <span
        className="font-sans text-gray-700 uppercase block text-center tracking-wide"
        style={{ fontSize: '0.65rem' }} // Slightly larger than 10px (approx. 10.4px) for better readability
      >
        {'AUTHORIZED SIGNATURE'}
      </span>
    </div>
  </div>
)}

          </div>

          {/* Payment Details / Notes (Right Side) */}
          <div style={{ flex: 1, minWidth: "250px", fontSize: "14px" }}>
            <div style={{ marginBottom: "12px" }}>
              <span className="payment-label" style={{ fontWeight: 700, color: "#000", display: "inline", marginRight: "8px" }}>
                Payment Method:
              </span>
              <span className="payment-value" style={{ color: "#333", display: "inline" }}>
                {data.paymentMethod || "Bank Transfer"}
              </span>
            </div>
            <div>
              <span className="note-label" style={{ fontWeight: 700, color: "#000", display: "inline", marginRight: "8px" }}>
                Note:
              </span>
              <span className="note-value" style={{ color: "#333", display: "inline" }}>
                {data.notes || "Thank you for your business!"}
              </span>
            </div>
            <div style={{ marginTop: "12px" }}>
              <span className="payment-label" style={{ fontWeight: 700, color: "#000", display: "block", marginBottom: "8px" }}>
                Terms & Conditions:
              </span>
              <div style={{ color: "#333", fontSize: "12px", lineHeight: "1.4" }}>
                {data.termsAndConditions || "Payment is due upon receipt. Late payments may incur fees."}
              </div>
            </div>
          </div>
        </div>

        {/* --- Signature Line --- */}
        {/* <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "100px" }}>
          <div style={{ width: "200px", textAlign: "center" }}>
            <div style={{ borderTop: "2px solid #000", marginBottom: "5px" }}></div>
            <p style={{ margin: 0, fontWeight: 700, color: "#000", fontSize: "12px", letterSpacing: "1px" }}>AUTHORIZED SIGNATURE</p>
          </div>
        </div> */}

        {/* --- Footer Wave (SVG background) --- */}
        <div
          className="wave-footer"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "150px",
            zIndex: 1,
            opacity: 0.4,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlnssvgjs="http://svgjs.dev/svgjs"
            width="1440"
            height="150"
            preserveAspectRatio="none"
            viewBox="0 0 1440 250"
          >
            <defs>
              <mask id="SvgjsMask1044">
                <rect width="1440" height="250" fill="#ffffff"></rect>
              </mask>
            </defs>
            <g mask="url(&quot;#SvgjsMask1044&quot;)" fill="none">
              <path d="M 0,77 C 57.6,99.8 172.8,197.4 288,191 C 403.2,184.6 460.8,50 576,45 C 691.2,40 748.8,165 864,166 C 979.2,167 1036.8,48.6 1152,50 C 1267.2,51.4 1382.4,148.4 1440,173L1440 250L0 250z" fill="rgba(179, 179, 179, 1)"></path>
              <path d="M 0,6 C 72,54 216,241.6 360,246 C 504,250.4 576,36.8 720,28 C 864,19.2 936,187.6 1080,202 C 1224,216.4 1368,120.4 1440,100L1440 250L0 250z" fill="rgba(37, 37, 37, 1)"></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}