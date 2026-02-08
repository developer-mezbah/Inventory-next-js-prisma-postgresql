import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const companyId = await getCompanyId();
    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    if (id === "sales") {
      const salesReports = await prisma.sale.findMany({
        where: { companyId: companyId },
        include: {
          transaction: true,
        },
      });
      return NextResponse.json(salesReports);
    }
    if (id === "transactions") {
      const transactions = await prisma.Transaction.findMany({
        where: { companyId: companyId },
      });
      return NextResponse.json(transactions);
    }
    if (id === "financial-statement") {
      const financialData = await getFinancialData(companyId);
      return NextResponse.json(financialData);
    }
  } catch (error) {
    console.log("Error fetching data:", error);
    return NextResponse.json({ error: error || "Failed to fetch Data!" }, { status: 500 });
  }
}


const getFinancialData = async (companyId) => {
  const result = await prisma.$transaction(async (tx) => {
    // Get all sales for the company
    const sales = await tx.sale.findMany({
      where: { companyId },
      include: {
        invoiceData: true,
        transaction: true,
      },
    });

    // Get all purchases for the company
    const purchases = await tx.purchase.findMany({
      where: { companyId },
      include: {
        invoiceData: true,
        transaction: true,
      },
    });

    // Get all expenses
    const expenses = await tx.expense.findMany({
      where: { companyId },
      include: {
        category: true,
        items: true,
        transaction: true,
      },
    });

    // Get company currency info
    const company = await tx.company.findUnique({
      where: { id: companyId },
      select: {
        currencyCode: true,
        currencySymbol: true,
      },
    });

    return { sales, purchases, expenses, company };
  });

  // Calculate values from the raw data
  const calculateTotals = () => {
    // Calculate total sales amount
    const totalSales = result.sales.reduce((sum, sale) => {
      return sum + (sale.amount || 0);
    }, 0);

    // Calculate total purchase amount
    const totalPurchases = result.purchases.reduce((sum, purchase) => {
      return sum + (purchase.amount || 0);
    }, 0);

    // Calculate total expenses (loan interest, processing fees, charges, etc.)
    const expensesByCategory = result.expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + (expense.price || 0);
      return acc;
    }, {});

    // Calculate Gross Profit (Sales - Purchases)
    const grossProfit = totalSales - totalPurchases;

    // Calculate total indirect expenses
    const loanInterestExpense = expensesByCategory['Loan Interest'] || 0;
    const loanProcessingFeeExpense = expensesByCategory['Processing Fee'] || 0;
    const loanChargesExpense = expensesByCategory['Loan Charges'] || 0;
    const otherExpense = expensesByCategory['Other'] || 0;

    const totalIndirectExpenses = loanInterestExpense +
      loanProcessingFeeExpense +
      loanChargesExpense +
      otherExpense;

    // Calculate Net Profit (Gross Profit - Indirect Expenses)
    const netProfit = grossProfit - totalIndirectExpenses;

    return {
      // Profit & Loss Summary
      grossProfit,
      otherIncome: 0, // Assuming no other income in current schema
      indirectExpenses: {
        otherExpense,
        loanInterestExpense,
        loanProcessingFeeExpense,
        loanChargesExpense,
      },
      netProfit,

      // Particulars
      particulars: {
        saleAmount: totalSales,
        creditNote: 0, // Not available in current schema
        saleFA: 0, // Not available in current schema
        purchaseAmount: totalPurchases,
        debitNote: 0, // Not available in current schema
        purchaseFA: 0, // Not available in current schema
        otherDirectExpenses: 0, // Not available as separate field
        paymentInDiscount: 0, // Not available in current schema
        taxPayable: 0, // Would need to be calculated from sales/purchases
        tcsPayable: 0, // Not available in current schema
      },

      // Currency info
      currencySymbol: result.company?.currencySymbol || '$',
      currencyCode: result.company?.currencyCode || 'USD',
    };
  };

  return calculateTotals();
};

// Example usage:
// const financialData = await getFinancialData("your-company-id-here");