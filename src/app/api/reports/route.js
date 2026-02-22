import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // For additional filtering
    const companyId = await getCompanyId();

    // If no ID parameter, return all loan accounts for the company
    if (!id) {
      const loanAccounts = await prisma.loanAccount.findMany({
        where: { companyId: companyId },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 10 // Get recent transactions
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(loanAccounts);
    }

    // Handle specific loan account by ID
    if (id && id !== "sales" && id !== "transactions" && id !== "financial-statement") {
      const loanAccount = await prisma.loanAccount.findUnique({
        where: { id: id },
        include: {
          transactions: {
            orderBy: { date: 'desc' }
          },
          company: true,
        },
      });

      if (!loanAccount) {
        return NextResponse.json({ error: "Loan account not found" }, { status: 404 });
      }

      // Verify company access
      if (loanAccount.companyId !== companyId) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }

      return NextResponse.json(loanAccount);
    }

    // Handle special cases
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
      // Filter by loan account if specified
      const loanAccountId = searchParams.get('loanAccountId');
      const whereClause = { 
        companyId: companyId,
        ...(loanAccountId && { loanAccountId: loanAccountId })
      };

      const transactions = await prisma.Transaction.findMany({
        where: whereClause,
        include: {
          loanAccount: true,
        },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json(transactions);
    }

    if (id === "financial-statement") {
      const financialData = await getFinancialData(companyId);
      
      // Enhance financial data with loan information
      const loanAccounts = await prisma.loanAccount.findMany({
        where: { companyId: companyId },
        select: {
          id: true,
          accountName: true,
          currentBalance: true,
          interestRate: true,
          loanReceivedIn: true,
        },
      });

      return NextResponse.json({
        ...financialData,
        loanAccounts: loanAccounts,
      });
    }

    // Handle summary statistics for loan accounts
    if (id === "summary") {
      const loanSummary = await prisma.loanAccount.aggregate({
        where: { companyId: companyId },
        _sum: {
          currentBalance: true,
          openingBalance: true,
          processingFee: true,
        },
        _avg: {
          interestRate: true,
        },
        _count: {
          id: true,
        },
      });

      // Get loans by type
      const loansByType = await prisma.loanAccount.groupBy({
        by: ['loanReceivedIn'],
        where: { companyId: companyId },
        _sum: {
          currentBalance: true,
        },
        _count: true,
      });

      return NextResponse.json({
        summary: loanSummary,
        byType: loansByType,
      });
    }

    // Handle loan accounts with low balance or due soon
    if (id === "alerts") {
      const loanAccounts = await prisma.loanAccount.findMany({
        where: { 
          companyId: companyId,
          currentBalance: { gt: 0 } // Active loans with balance
        },
        include: {
          transactions: {
            where: {
              date: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last month
              }
            },
            orderBy: { date: 'desc' },
          },
        },
      });
console.log("Loan Accounts with Alerts:", loanAccounts);
      return NextResponse.json(loanAccounts);
    }

  } catch (error) {
    console.log("Error fetching data:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch Data!" }, { status: 500 });
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