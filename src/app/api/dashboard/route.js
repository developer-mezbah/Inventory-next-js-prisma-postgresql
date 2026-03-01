
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get period from URL query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "thisMonth";
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "No company found" },
        { status: 404 }
      );
    }

    // Fetch all dashboard data in parallel
    const [
      company,
      totalReceivable,
      totalPayable,
      lowStockItems,
      totalSales,
      recentTransactions,
      itemsByCategory,
      salesChartData,
      purchaseData,
      totalCashBalance,
      overdueInvoices,
      expenseData,
    ] = await Promise.all([
      // Company data
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          currencySymbol: true,
        }
      }),

      // Total Receivable - sum of balanceDue from sales
      prisma.sale.aggregate({
        where: {
          companyId,
          balanceDue: { gt: 0 },
          isPaid: false
        },
        _sum: { balanceDue: true },
      }),

      // Total Payable - sum of balanceDue from purchases
      prisma.purchase.aggregate({
        where: {
          companyId,
          balanceDue: { gt: 0 },
          isPaid: false
        },
        _sum: { balanceDue: true },
      }),

      // Low stock items - Since stock is JSON, we need to fetch all items
      prisma.item.findMany({
        where: {
          companyId,
          stock: {
            not: null
          }
        },
        select: {
          id: true,
          itemName: true,
          stock: true
        }
      }),

      // Total sales amount for the selected period
      prisma.sale.aggregate({
        where: {
          companyId,
          createdAt: getDateRangeForPeriod(period),
        },
        _sum: { amount: true },
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: {
          companyId,
        },
        select: {
          id: true,
          amount: true,
          type: true,
          createdAt: true,
          party: {
            select: {
              id: true,
              partyName: true,
            }
          },
          sale: {
            select: {
              id: true,
              billNumber: true
            }
          },
          purchase: {
            select: {
              id: true,
              billNumber: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),

      // Items grouped by category
      prisma.category.findMany({
        where: {
          companyId,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              items: true
            }
          }
        },
      }),

      getSalesChartData(companyId, period),
      getPurchaseVsSales(companyId, period),

      // NEW: Total Cash Balance (from CashAdjustment)
      prisma.cashAdjustment.findFirst({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        select: { cashInHand: true }
      }),

      // NEW: Overdue Invoices
      prisma.sale.count({
        where: {
          companyId,
          isPaid: false,
          balanceDue: { gt: 0 }
        }
      }),

      // NEW: Expense Data
      prisma.purchase.aggregate({
        where: {
          companyId,
          createdAt: getDateRangeForPeriod(period),
        },
        _sum: { amount: true },
      }),
    ]);

    // Calculate profit/loss manually
    const profitLossData = await getProfitLossData(companyId, period);

    // Get top customers and products
    const topCustomers = await getTopCustomers(companyId, period);
    const topProducts = await getTopProducts(companyId, period);

    // Fetch cash and bank accounts
    const accounts = await prisma.cashAndBank.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        accountdisplayname: true,
        openingbalance: true,
        asofdate: true,
      },
      orderBy: {
        openingbalance: 'desc',
      },
    });

    // Count low stock items from JSON stock field
    const underperformingItemsCount = lowStockItems.filter(item => {
      if (!item.stock) return false;

      try {
        const stockInfo = typeof item.stock === 'string'
          ? JSON.parse(item.stock)
          : item.stock;

        const openingQuantity = stockInfo.openingQuantity || 0;
        const minStockToMaintain = stockInfo.minStockToMaintain || 0;

        return minStockToMaintain > 0 && openingQuantity <= minStockToMaintain;
      } catch (error) {
        console.error("Error parsing stock JSON for item:", item.id, error);
        return false;
      }
    }).length;

    // Format items by category data
    const formattedItemsByCategory = itemsByCategory.map((cat) => ({
      id: cat.id,
      label: cat.name,
      value: cat._count?.items || 0,
    }));

    return NextResponse.json({
      totalReceivable: totalReceivable._sum?.balanceDue || 0,
      totalPayable: totalPayable._sum?.balanceDue || 0,
      underperformingItems: underperformingItemsCount,
      totalSales: totalSales._sum?.amount || 0,
      recentTransactions,
      itemsByCategory: formattedItemsByCategory,
      salesChartData: salesChartData || [],
      purchaseData: purchaseData || { purchases: 0, sales: 0 },
      company: company || null,

      // NEW METRICS
      cashBalance: totalCashBalance?.cashInHand || 0,
      topCustomers: topCustomers || [],
      topProducts: topProducts || [],
      overdueInvoices: overdueInvoices || 0,
      profitLoss: profitLossData || { profit: 0, margin: 0 },
      totalExpenses: expenseData._sum?.amount || 0,
      accounts: accounts || [],
    });

  } catch (error) {
    console.log("Dashboard data error:", error);
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Helper function to get date range based on period
function getDateRangeForPeriod(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const dayOfWeek = now.getDay();

  let startDate;
  let endDate = new Date(year, month, day, 23, 59, 59, 999);

  switch (period) {
    case "lastMonth": {
      const lastMonth = month - 1;
      const lastMonthYear = lastMonth < 0 ? year - 1 : year;
      const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
      startDate = new Date(lastMonthYear, adjustedLastMonth, 1);
      endDate = new Date(lastMonthYear, adjustedLastMonth + 1, 0, 23, 59, 59, 999);
      break;
    }
    case "thisWeek": {
      const weekStartDay = day - dayOfWeek;
      startDate = new Date(year, month, weekStartDay);
      break;
    }
    case "thisQuarter": {
      const quarter = Math.floor(month / 3);
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);
      break;
    }
    case "halfYear": {
      startDate = new Date(year, month - 6, day);
      break;
    }
    case "thisYear": {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      break;
    }
    case "thisMonth":
    default: {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      break;
    }
  }

  return {
    gte: startDate,
    lte: endDate,
  };
}

// Helper function to generate chart data
async function getSalesChartData(companyId, period = "thisMonth") {
  try {
    const dateRange = getDateRangeForPeriod(period);

    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        createdAt: dateRange,
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const groupedData = sales.reduce((acc, sale) => {
      if (!sale.createdAt) return acc;
      const dateKey = sale.createdAt.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Number(sale.amount || 0);
      return acc;
    }, {});

    const chartData = [];
    const startDate = new Date(dateRange.gte);
    const endDate = new Date(dateRange.lte);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      chartData.push({
        x: dateKey,
        y: groupedData[dateKey] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return [];
  }
}

async function getPurchaseVsSales(companyId, period = "thisMonth") {
  try {
    const dateRange = getDateRangeForPeriod(period);

    const [purchases, sales] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          companyId,
          createdAt: dateRange,
        },
        _sum: { amount: true },
      }),
      prisma.sale.aggregate({
        where: {
          companyId,
          createdAt: dateRange,
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      purchases: Number(purchases._sum?.amount || 0),
      sales: Number(sales._sum?.amount || 0),
    };
  } catch (error) {
    console.error("Error fetching purchase vs sales data:", error);
    return { purchases: 0, sales: 0 };
  }
}

// NEW: Calculate Profit/Loss
async function getProfitLossData(companyId, period = "thisMonth") {
  try {
    const dateRange = getDateRangeForPeriod(period);

    const [sales, purchases] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          companyId,
          createdAt: dateRange,
        },
        _sum: { amount: true },
      }),
      prisma.purchase.aggregate({
        where: {
          companyId,
          createdAt: dateRange,
        },
        _sum: { amount: true },
      }),
    ]);

    const totalSales = sales._sum?.amount || 0;
    const totalPurchases = purchases._sum?.amount || 0;
    const profit = totalSales - totalPurchases;
    const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

    return {
      profit,
      margin: parseFloat(margin.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching profit/loss data:", error);
    return { profit: 0, margin: 0 };
  }
}

// NEW: Get Top Customers - FIXED: Sale model doesn't have party relation
async function getTopCustomers(companyId, period = "thisMonth") {
  try {
    const dateRange = getDateRangeForPeriod(period);

    // Get all sales in the period
    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        createdAt: dateRange,
        partyId: { not: null }
      },
      select: {
        id: true,
        amount: true,
        partyId: true,
        partyName: true, // Use partyName from Sale model
      }
    });

    // Group manually in JavaScript
    const customerMap = new Map();

    sales.forEach(sale => {
      if (sale.partyId) {
        const current = customerMap.get(sale.partyId) || {
          partyId: sale.partyId,
          partyName: sale.partyName || 'Unknown Customer',
          totalAmount: 0
        };
        current.totalAmount += Number(sale.amount || 0);
        customerMap.set(sale.partyId, current);
      }
    });

    // Convert to array and sort
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)
      .map(customer => ({
        partyId: customer.partyId,
        partyName: customer.partyName,
        _sum: {
          amount: customer.totalAmount
        }
      }));

    return topCustomers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

// NEW: Get Top Products from InvoiceData - FIXED: Use proper approach
async function getTopProducts(companyId, period = "thisMonth") {
  try {
    const dateRange = getDateRangeForPeriod(period);

    // Get invoice data from sales in the period
    const invoiceData = await prisma.invoiceData.findMany({
      where: {
        sale: {
          companyId,
          createdAt: dateRange
        }
      },
      select: {
        id: true,
        itemName: true,
        qty: true,
        price: true,
        itemId: true
      }
    });

    // Group manually in JavaScript
    const productMap = new Map();

    invoiceData.forEach(item => {
      if (item.itemName) {
        const key = item.itemId || item.itemName;
        const current = productMap.get(key) || {
          itemId: item.itemId,
          itemName: item.itemName,
          totalQuantity: 0,
          totalRevenue: 0
        };
        current.totalQuantity += Number(item.qty || 0);
        current.totalRevenue += Number((item.qty || 0) * (item.price || 0));
        productMap.set(key, current);
      }
    });

    // Convert to array and sort
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map(product => ({
        itemId: product.itemId,
        itemName: product.itemName,
        _sum: {
          quantity: product.totalQuantity,
          total: product.totalRevenue
        }
      }));

    return topProducts;
  } catch (error) {
    console.error("Error fetching top products:", error);
    return [];
  }
}