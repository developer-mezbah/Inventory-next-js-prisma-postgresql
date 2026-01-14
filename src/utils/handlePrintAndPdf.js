import { generatePDF } from "@/lib/pdf-generator";
import client_api from "./API_FETCH";

const handlePrint = () => {
  const printWindow = window.open("", "", "width=900,height=1200");
  const invoiceElement = document.querySelector("[data-invoice-preview]");
  if (invoiceElement) {
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((el) => el.outerHTML)
      .join("");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${styles}
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              body {
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 10mm;
                margin: 0;
                line-height: 1.4;
                color: #1f2937;
              }
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                html, body {
                  width: 210mm;
                  height: auto;
                  margin: 0;
                  padding: 0;
                }
                body {
                  margin: 0;
                  padding: 10mm;
                  background: white;
                }
                [data-invoice-preview] {
                  width: 100%;
                  max-width: 100%;
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                  page-break-after: avoid;
                }
              }
              [data-invoice-preview] {
                width: 100%;
                overflow: visible;
              }
              /* Prevent page breaks in critical sections */
              .invoice-section {
                page-break-inside: avoid;
              }
              /* Ensure table fits without splitting */
              table {
                width: 100%;
              }
              tr {
                page-break-inside: avoid;
              }
              /* Reduce padding for print */
              @media print {
                [data-invoice-preview] div {
                  margin-bottom: 8px !important;
                }
                p, span, td, th {
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
            </style>
          </head>
          <body>
            ${invoiceElement.innerHTML}
          </body>
        </html>
      `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export function printAndPdfData(printType, setInvoiceData, id, invoiceType) {
  client_api
    .get(
      `/api/print-data?id=${id}&type=${
        invoiceType === "Sale" ? "Sale" : "Purchase"
      }`
    )
    .then(async (res) => {
      if (res?.status) {
        const storePrintData = {
          companyName: res?.printData?.company?.name || "My Company",
          phone: res?.printData?.company?.phoneNumber || "18XXXXXXXX",
          email: res?.printData?.company?.emailId || "info@mycompany.com",
          address:
            res?.printData?.company?.businessAddress || "123 Business Street",
          logoUrl: res?.printData?.company?.logoUrl || "/logo.png",
          signatureUrl: res?.printData?.company?.signatureUrl,
          invoiceNumber: "1",
          date: new Date().toISOString().split("T")[0],
          dueDate: "",
          billTo: res?.printData?.partyName || "Sakib",
          billToEmail: res?.printData?.phoneNumber || "client@example.com",
          paymentMethod: res?.printData?.paymentType,
          items: res?.printData?.invoiceData.map((item, index) => ({
            id: index + 1,
            description: item.itemName,
            quantity: item.qty,
            rate: item.unitPrice,
            amount: item.price,
          })),
          totalAmount: res?.printData?.amount,
          paidAmount: res?.printData?.paidAmount,
          tax: res?.printData?.tax,
          discount: res?.printData?.discount,
          isPaid: res?.printData?.isPaid,
          balanceDue: res?.printData?.balanceDue,
          notes: "Thanks for doing business with us!",
          termsAndConditions: "Payment due within 30 days",
        };
        setInvoiceData(storePrintData);
        printType === "pdf"
          ? await generatePDF(storePrintData)
          : setTimeout(() => {
              handlePrint();
            }, 400);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
