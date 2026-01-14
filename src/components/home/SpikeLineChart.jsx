"use client";
import { ResponsiveLine } from "@nivo/line";

// const spikeData = [
//   {
//     id: "Metric Value",
//     data: [
//       { x: "2025-11-01", y: 0 },
//       { x: "2025-11-04", y: 0 },
//       { x: "2025-11-07", y: 0 },
//       { x: "2025-11-08", y: 0 },
//       { x: "2025-11-09", y: 100 }, // THE PEAK
//       { x: "2025-11-10", y: 0 },
//       { x: "2025-11-13", y: 0 },
//       { x: "2025-11-16", y: 0 },
//       { x: "2025-11-19", y: 0 },
//       { x: "2025-11-22", y: 0 },
//       { x: "2025-11-25", y: 0 },
//       { x: "2025-11-28", y: 0 },
//     ],
//   },
// ];

// const SpikeLineChart = () => (
//   // Set a container size for the chart (important for Nivo's responsiveness)
//   <div style={{ height: "300px", width: "800px" }}>
//     <ResponsiveLine
//       data={spikeData}
//       margin={{ top: 20, right: 30, bottom: 50, left: 40 }}
//       // --- X-Axis (Time Scale) ---
//       xScale={{
//         type: "time",
//         format: "%Y-%m-%d",
//         precision: "day",
//         useUTC: false, // Set to false if working with local time
//       }}
//       xFormat="time:%b %d" // Format for the tooltip
//       // --- Y-Axis (Linear Scale) ---
//       yScale={{
//         type: "linear",
//         min: 0,
//         max: 100, // Ensure the max value is 100
//       }}
//       // --- General Styling ---
//       curve="linear" // Crucial for the sharp V/spike shape
//       colors={["#4299e1"]} // The blue line color
//       lineWidth={2}
//       enablePoints={false} // Hide the data points on the line
//       // --- Grid & Axes Customization ---
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "",
//         legendOffset: 36,
//         // Adjust tick values to match the dates on your image (e.g., 'every 3 days')
//         tickValues: "every 3 days",
//         format: "%d %b", // e.g., '1 Nov'
//       }}
//       axisLeft={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "",
//         legendOffset: -40,
//         // Show ticks for 0, 20, 40, 60, 80, 100
//         tickValues: [0, 20, 40, 60, 80, 100],
//       }}
//       // --- Interactivity ---
//       enableGridX={false}
//       enableGridY={true}
//       isInteractive={true}
//       useMesh={true}
//     />
//   </div>
// );

// export default SpikeLineChart;

const SpikeLineChart = ({ data = [] }) => {
  const chartData = [
    {
      id: "Sales",
      data:
        data.length > 0
          ? data
          : [{ x: new Date().toISOString().split("T")[0], y: 0 }],
    },
  ];
  console.log({ data, chartData });

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 50, left: 40 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day",
          useUTC: false,
        }}
        xFormat="time:%b %d"
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
        }}
        curve="linear"
        colors={["#4299e1"]}
        lineWidth={2}
        enablePoints={true}
        pointSize={6}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Date",
          legendOffset: 36,
          tickValues: "every 3 days",
          format: "%d %b",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          // legend: "Amount ($)",
          legendOffset: -40,
        }}
        enableGridX={false}
        enableGridY={true}
        isInteractive={true}
        useMesh={true}
        enableSlices="x"
        tooltip={({ point }) => (
          <div
            style={{
              background: "white",
              padding: "9px 12px",
              border: "1px solid #ccc",
              fontSize: "14px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <strong>{point.data.xFormatted}</strong>
            <br />
            Sales: ${point.data.yFormatted}
          </div>
        )}
      />
    </div>
  );
};

export default SpikeLineChart;
