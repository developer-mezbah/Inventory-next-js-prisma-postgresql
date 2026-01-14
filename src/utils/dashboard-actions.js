// app/actions/dashboard-actions.js
"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getCompanyId } from "./GetCompanyId";

// Update the function to accept period parameter
export async function getDashboardData(period = "thisMonth") {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const companyId = await getCompanyId();

    if (!companyId) {
      throw new Error("No company found");
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
    ] = await Promise.all([
      // Company data
      prisma.company.findUnique({
        where: { id: companyId },
      }),

      // Total Receivable - sum of balanceDue from sales
      prisma.sale.aggregate({
        where: { 
          companyId, 
          balanceDue: { gt: 0 },
          isPaid: false // Only count unpaid sales
        },
        _sum: { balanceDue: true },
      }),

      // Total Payable - sum of balanceDue from purchases
      prisma.purchase.aggregate({
        where: { 
          companyId, 
          balanceDue: { gt: 0 },
          isPaid: false // Only count unpaid purchases
        },
        _sum: { balanceDue: true },
      }),

      // Low stock items - find items where openingQuantity <= minStockToMaintain
      // We'll fetch all items with stock and filter in JavaScript
      prisma.item.findMany({
        where: {
          companyId,
          // stock: {
          //   isNot: null
          // }
        },
        // include: {
        //   stock: true
        // }
      }),

      // Total sales amount for the selected period
      prisma.sale.aggregate({
        where: {
          companyId,
          createdAt: getDateRangeForPeriod(period),
        },
        _sum: { amount: true },
      }),

      // Recent transactions - include both sales and purchases
      prisma.transaction.findMany({
        where: { 
          companyId,
        },
        include: { 
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
        include: { 
          _count: { 
            select: { 
              items: true
            } 
          } 
        },
      }),

      getSalesChartData(companyId, period),
      getPurchaseVsSales(companyId, period),
    ]);

    // Count low stock items - filter in JavaScript
    const underperformingItemsCount = lowStockItems.filter(item => {
      if (!item.stock) return false;
      
      const openingQuantity = item.stock.openingQuantity || 0;
      const minStockToMaintain = item.stock.minStockToMaintain || 0;
      
      // Only consider items where minStockToMaintain is set (> 0)
      return minStockToMaintain > 0 && openingQuantity <= minStockToMaintain;
    }).length;

    // Format items by category data
    const formattedItemsByCategory = itemsByCategory.map((cat) => ({
      id: cat.id,
      label: cat.name,
      value: cat._count?.items || 0,
    }));

    return {
      totalReceivable: totalReceivable._sum?.balanceDue || 0,
      totalPayable: totalPayable._sum?.balanceDue || 0,
      underperformingItems: underperformingItemsCount,
      totalSales: totalSales._sum?.amount || 0,
      recentTransactions,
      itemsByCategory: formattedItemsByCategory,
      salesChartData: salesChartData || [],
      purchaseData: purchaseData || { purchases: 0, sales: 0 },
      company: company || null,
    };
  } catch (error) {
    console.error("Dashboard data error:", error);
    throw new Error(`Failed to fetch dashboard data: ${error.message || 'Unknown error'}`);
  }
}

// Helper function to get date range based on period
function getDateRangeForPeriod(period) {
  const now = new Date();
  
  // Extract values
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
      // Week start = Sunday (0)
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

    // Fetch sales for the selected period
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

    // Group sales by date
    const groupedData = sales.reduce((acc, sale) => {
      if (!sale.createdAt) return acc;
      
      const dateKey = sale.createdAt.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Number(sale.amount || 0);
      return acc;
    }, {});

    // Generate all dates for the selected period
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