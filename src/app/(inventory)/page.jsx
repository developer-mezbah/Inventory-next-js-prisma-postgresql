import GetCurrencty from "@/components/home/GetCurrencty";
import SalesDashboard from "@/components/home/SalesDashboard";
import { getDashboardData } from "@/utils/dashboard-actions";
import Link from "next/link";
import { BsGraphUp } from "react-icons/bs";
import {
  FiAlertCircle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiPlusCircle,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const data = await getDashboardData(params?.period);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Business Overview
                </h1>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Dashboard
              </h2>
              <p className="text-gray-600 mt-2">
                Welcome back to{" "}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {data.company.name}
                </span>
                •{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/items/products"
                className="inline-flex items-center px-5 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <FiEdit3 className="h-4 w-4 mr-2 text-purple-600" />
                Product & Service
              </Link>
              <Link
                href="/cash-bank/bank-accounts"
                className="inline-flex items-center px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 shadow-purple-500/20"
              >
                <FiPlusCircle className="h-4 w-4 mr-2 text-white" />
                Cash & Bank
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Receivable */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <FiDollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center px-2 py-1 bg-green-50 rounded-lg">
                <FiArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-600">
                  12.5%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">Total Receivable</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                <GetCurrencty /> {data.totalReceivable.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
          </div>

          {/* Total Payable */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <FiCreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center px-2 py-1 bg-red-50 rounded-lg">
                <FiArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-xs font-medium text-red-600">3.2%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">Total Payable</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                <GetCurrencty /> {data.totalPayable.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Due next week</p>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex items-center px-2 py-1 bg-yellow-50 rounded-lg">
                <FiAlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-xs font-medium text-yellow-600">
                  Requires attention
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">Low Stock Items</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {data.underperformingItems}
              </span>
              <span className="text-sm text-gray-500 ml-2">items</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/inventory"
                className="text-xs font-medium text-red-600 hover:text-red-700 inline-flex items-center"
              >
                Review inventory
                <FiChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center px-2 py-1 bg-green-50 rounded-lg">
                <FiArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-600">
                  24.7%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">Total Sales</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                <GetCurrencty /> {data.totalSales.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Purchases */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiShield className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Purchases
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <GetCurrencty />
                  {data.purchaseData.purchases.toFixed(2)}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Total purchases this quarter
                </p>
              </div>
              <FiBarChart2 className="h-12 w-12 text-amber-600 opacity-50" />
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">
                    Recent Sales
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <GetCurrencty />
                  {data.purchaseData.sales.toFixed(2)}
                </p>
                <p className="text-sm text-teal-700 mt-1">
                  Last 7 days revenue
                </p>
              </div>
              <BsGraphUp className="h-12 w-12 text-teal-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts and Secondary Metrics */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales Trend
                </h3>
                <p className="text-sm text-gray-500">
                  Last 30 days performance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
                  <span className="text-xs text-gray-600">Revenue</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 ml-4">
                  <FiRefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="">
              <SalesDashboard initialData={data} />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <Link
                  href="/transactions"
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 inline-flex items-center"
                >
                  View all
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px]">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg mr-3 ${
                        transaction.type === "Sale"
                          ? "bg-green-50"
                          : "bg-blue-50"
                      }`}
                    >
                      {transaction.type === "Sale" ? (
                        <FiArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <FiArrowDownRight className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.party?.partyName || "No Party"}
                      </p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            transaction.type === "Sale"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          <FiCalendar className="h-3 w-3 inline mr-1" />
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-right ${
                        transaction.amount && transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <p className="font-semibold">
                        <GetCurrencty />
                        {Math.abs(transaction.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {data.company.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <span className="text-xs text-gray-400 inline-flex items-center">
                <FiClock className="h-3 w-3 mr-1" />
                Data updates in real-time
              </span>
              <div className="h-1 w-1 rounded-full bg-gray-300"></div>
              <span className="text-xs text-gray-400">
                Last updated: Just now
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
