// components/SalesDashboard.jsx
"use client";

import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { ResponsiveLine } from "@nivo/line";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Enhanced time period options with configurations
const timePeriods = [
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisWeek", label: "This Week" },
  { id: "thisQuarter", label: "This Quarter" },
  { id: "halfYear", label: "Half Year" },
  { id: "thisYear", label: "This Year" },
];

const SalesDashboard = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencySymbol, formatPrice } = useCurrencyStore();

  // Get initial period from URL or default to "thisMonth"
  const initialPeriod = searchParams.get("period") || "thisMonth";
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(initialData?.totalSales || 0);

  // Helper functions for date calculations
  const getUTCDate = (year, month, day) => {
    return new Date(Date.UTC(year, month, day));
  };

  const formatDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Generate dates for different periods
  const generateDateRange = (period) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const periodMap = {
      // Week periods
      thisWeek: () => {
        const start = new Date(today);
        start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // Start of week (Sunday)
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6); // End of week (Saturday)
        return {
          start,
          end,
          interval: "day",
        };
      },

      // Month periods
      thisMonth: () => {
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        return {
          start: getUTCDate(year, month, 1),
          end: getUTCDate(year, month + 1, 0),
          interval: "day",
        };
      },
      lastMonth: () => {
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth() - 1;
        return {
          start: getUTCDate(year, month, 1),
          end: getUTCDate(year, month + 1, 0),
          interval: "day",
        };
      },

      // Quarter periods
      thisQuarter: () => {
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const quarter = Math.floor(month / 3);
        const quarterStartMonth = quarter * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        return {
          start: getUTCDate(year, quarterStartMonth, 1),
          end: getUTCDate(year, quarterEndMonth + 1, 0),
          interval: "week", // Weekly intervals for quarters
        };
      },

      // Year periods
      thisYear: () => {
        const year = today.getUTCFullYear();
        return {
          start: getUTCDate(year, 0, 1),
          end: getUTCDate(year, 11, 31),
          interval: "month", // Monthly intervals for years
        };
      },
      // Half-Year periods
      halfYear: () => {
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();

        // Determine if we are in the first half (0-5) or second half (6-11)
        const isFirstHalf = month < 6;
        const startMonth = isFirstHalf ? 0 : 6;
        const endMonth = isFirstHalf ? 5 : 11;

        return {
          start: getUTCDate(year, startMonth, 1),
          // Setting day to 0 of the following month gets the last day of the target month
          end: getUTCDate(year, endMonth + 1, 0),
          interval: "month",
        };
      },
    };

    return periodMap[period] ? periodMap[period]() : periodMap.thisMonth();
  };

  // Generate all dates for the selected period
  const generateAllDates = (range) => {
    const { start, end, interval } = range;
    const dates = [];
    const current = new Date(start);

    switch (interval) {
      case "hour":
        // Generate hourly data for day view
        for (let i = 0; i <= 23; i++) {
          const date = new Date(current);
          date.setUTCHours(i, 0, 0, 0);
          dates.push({
            x: formatDateKey(date),
            y: 0,
            hour: i,
          });
        }
        break;

      case "day":
        // Generate daily data
        while (current <= end) {
          dates.push({
            x: formatDateKey(current),
            y: 0,
          });
          current.setUTCDate(current.getUTCDate() + 1);
        }
        break;

      case "week":
        // Generate weekly data (start of each week)
        const weekStart = new Date(current);
        while (weekStart <= end) {
          dates.push({
            x: formatDateKey(weekStart),
            y: 0,
            week: `Week of ${weekStart.getUTCDate()}`,
          });
          weekStart.setUTCDate(weekStart.getUTCDate() + 7);
        }
        break;

      case "month":
        // Generate monthly data (first of each month)
        const monthStart = new Date(current);
        monthStart.setUTCDate(1);
        while (monthStart <= end) {
          dates.push({
            x: formatDateKey(monthStart),
            y: 0,
            month: monthStart.toLocaleDateString("en-US", { month: "short" }),
          });
          monthStart.setUTCMonth(monthStart.getUTCMonth() + 1);
        }
        break;
    }

    return dates;
  };

  // Merge generated dates with actual sales data
  const mergeDataWithActualSales = (generatedDates, actualData) => {
    const salesMap = {};
    actualData.forEach((item) => {
      salesMap[item.x] = item.y;
    });

    return generatedDates.map((date) => ({
      ...date,
      y: salesMap[date.x] || 0,
    }));
  };

  // Process data when period changes
  useEffect(() => {
    if (initialData?.salesChartData) {
      setLoading(true);

      // Generate date range for selected period
      const range = generateDateRange(selectedPeriod);

      // Generate all dates for the period
      const allDates = generateAllDates(range);

      // Merge with actual data
      const processedData = mergeDataWithActualSales(
        allDates,
        initialData.salesChartData
      );

      // Calculate total sales for the period
      const periodTotal = processedData.reduce((sum, item) => sum + item.y, 0);

      setSalesData(processedData);
      setTotalSales(periodTotal);
      setLoading(false);
    }
  }, [selectedPeriod, initialData]);

  const handlePeriodChange = async (period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    setSelectedPeriod(period);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Get tick interval based on period and data length - FIXED
  const getTickInterval = () => {
    const range = generateDateRange(selectedPeriod);

    // Use the actual salesData length to determine tick interval
    const dataLength = salesData.length;

    switch (range.interval) {
      case "hour":
        return "every 3 hours";
      case "day":
        // Use the actual data length instead of undefined 'data'
        return dataLength > 30 ? "every 7 days" : "every 2 days";
      case "week":
        return "every 2 weeks";
      case "month":
        return "every 2 months";
      default:
        return "every 7 days";
    }
  };

  // Get date format based on period
  const getDateFormat = (value) => {
    const range = generateDateRange(selectedPeriod);
    const date = new Date(value);

    switch (range.interval) {
      case "hour":
        return `${date.getUTCHours()}:00`;
      case "day":
        const day = date.getUTCDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });
        return `${day} ${month}`;
      case "week":
        const weekStart = date.getUTCDate();
        const weekEnd = new Date(date);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
        return `${weekStart}-${weekEnd.getUTCDate()} ${date.toLocaleDateString(
          "en-US",
          { month: "short" }
        )}`;
      case "month":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
    }
  };

  return (
    <div className="sales-dashboard">
      {/* Header with title and period selector */}
      <div className="dashboard-header">
        <div className="flex w-full justify-between items-center mb-4">
          <h1 className="dashboard-title">Total Sales</h1>
          <span className="text-xl font-semibold text-gray-700">
            {formatPrice(totalSales)}
          </span>
        </div>
        <div className="period-selector">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              className={`period-btn ${
                selectedPeriod === period.id ? "active" : ""
              }`}
              onClick={() => handlePeriodChange(period.id)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart section */}
      <div className="chart-section">
        <div className="chart-container">
          {loading ? (
            <div className="loading">Loading chart data...</div>
          ) : (
            <SalesLineChart
              data={salesData}
              selectedPeriod={selectedPeriod}
              tickInterval={getTickInterval()}
              dateFormat={getDateFormat}
              currencySymbol={currencySymbol}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Line Chart component
const SalesLineChart = ({
  data = [],
  selectedPeriod,
  tickInterval,
  dateFormat,
  currencySymbol,
}) => {
  const { formatPrice } = useCurrencyStore();

  const chartData = [
    {
      id: "Sales",
      data: data.length > 0 ? data : [],
    },
  ];

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="no-data-message">
        No data available for the selected period
      </div>
    );
  }

  // Determine chart margins based on period
  const getMargins = () => {
    const range =
      selectedPeriod.includes("year") || selectedPeriod.includes("365")
        ? { top: 20, right: 30, bottom: 100, left: 70 }
        : { top: 20, right: 30, bottom: 80, left: 60 };
    return range;
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <ResponsiveLine
        data={chartData}
        margin={getMargins()}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day",
          useUTC: true,
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: 0,
          max: "auto",
          stacked: false,
        }}
        curve="monotoneX"
        colors={["#3b82f6"]}
        lineWidth={2}
        enablePoints={data.length < 100} // Disable points for large datasets
        pointSize={6}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor="#3b82f6"
        enableArea={true}
        areaOpacity={0.1}
        areaBaselineValue={0}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 10,
          tickRotation: -45,
          legendOffset: 50,
          legendPosition: "middle",
          tickValues: tickInterval,
          format: dateFormat,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 10,
          tickRotation: 0,
          legendOffset: -50,
          legendPosition: "middle",
          format: (value) => `${currencySymbol}${value.toLocaleString()}`,
        }}
        enableGridX={false}
        enableGridY={true}
        gridYValues={5}
        gridYStroke="#f3f4f6"
        isInteractive={true}
        useMesh={true}
        enableSlices="x"
        tooltip={({ point }) => {
          const date = new Date(point.data.x);
          let formattedDate;

          if (
            selectedPeriod.includes("day") &&
            !selectedPeriod.includes("days")
          ) {
            formattedDate = date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          } else if (selectedPeriod.includes("week")) {
            const weekEnd = new Date(date);
            weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
            formattedDate = `${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - ${weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`;
          } else if (
            selectedPeriod.includes("month") ||
            selectedPeriod.includes("quarter")
          ) {
            formattedDate = date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
          } else {
            formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }

          return (
            <div className="chart-tooltip">
              <strong>{formattedDate}</strong>
              <div>
                Sales: <strong>{formatPrice(point.data.y)}</strong>
              </div>
            </div>
          );
        }}
        theme={{
          axis: {
            ticks: {
              text: {
                fontSize: 11,
                fill: "#6b7280",
              },
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: "white",
              fontSize: "12px",
            },
          },
        }}
        motionConfig="gentle"
      />
    </div>
  );
};

// CSS Styles
const styles = `
.sales-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.period-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-bottom: 8px;
  overflow-x: auto;
}

.period-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  font-weight: 500;
}

.period-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  color: #3b82f6;
}

.period-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.chart-section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #f9fafb;
}

.chart-container {
  width: 100%;
  min-height: 300px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  font-size: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
}

.chart-tooltip {
  background: white;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-tooltip strong {
  color: #111827;
  display: block;
  margin-bottom: 4px;
}

.chart-tooltip div {
  color: #3b82f6;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sales-dashboard {
    padding: 16px;
  }
  
  .dashboard-title {
    font-size: 20px;
  }
  
  .period-selector {
    gap: 6px;
    padding-bottom: 12px;
  }
  
  .period-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .chart-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .period-selector {
    justify-content: flex-start;
    padding-bottom: 16px;
  }
  
  .period-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
`;

// Dynamically add styles
if (typeof document !== "undefined") {
  const styleId = "sales-dashboard-styles";
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
}

export default SalesDashboard;
