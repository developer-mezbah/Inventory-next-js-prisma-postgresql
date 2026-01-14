"use client";
import { ResponsivePie } from "@nivo/pie";

// --- Sample Data ---
const studentTypeData = [
  {
    id: "Online Only",
    label: "Online Only",
    value: 450,
    color: "hsl(210, 70%, 50%)",
  },
  { id: "Hybrid", label: "Hybrid", value: 350, color: "hsl(120, 70%, 50%)" },
  {
    id: "In-Person",
    label: "In-Person",
    value: 200,
    color: "hsl(0, 70%, 50%)",
  },
];

const StudentTypeDonut = () => {
  const totalStudents = studentTypeData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    // --- Professional Responsiveness: Aspect Ratio Container ---
    // This ensures the container scales proportionally (1:1 aspect ratio)
    // regardless of the parent element's width, which is key for a square chart like a donut.
    <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
      <div
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <ResponsivePie
          data={studentTypeData}
          // Adjusted margins for better fit in the small box
          margin={{ top: 10, right: 10, bottom: 60, left: 10 }}
          // --- Donut Configuration ---
          innerRadius={0.65}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          // --- Colors and Style ---
          colors={{ scheme: "set2" }}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          // --- Arc Labels (Slices) ---
          // Using value to show the percentage directly on the slices
          enableArcLabels={true}
          arcLabelsComponent={({ datum, label, style }) => (
            <g transform={style.transform} style={{ pointerEvents: "none" }}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fill: "black",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {/* {`${((datum.value / totalStudents) * 100).toFixed(0)}%`} */}
                100%
              </text>
            </g>
          )}
          // --- Tooltip for professional detail ---
          tooltip={({ datum }) => (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "9px 12px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <strong>{datum.id}</strong>
              <br />
              Value: {datum.value}
              <br />
              Share: {((datum.value / totalStudents) * 100).toFixed(1)}%
            </div>
          )}
          // --- Legend (Below the chart for smaller screens) ---
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 50,
              itemsSpacing: 10,
              itemWidth: 90, // Reduced width for small screens
              itemHeight: 18,
              itemTextColor: "#555",
              symbolSize: 12, // Reduced size
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: { itemTextColor: "#000" },
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default StudentTypeDonut;

// "use client";
// import { ResponsivePie } from "@nivo/pie";

// const StudentTypeDonut = ({ data = [] }) => {
//   const totalItems = data.reduce((sum, item) => sum + item.value, 0);

//   return (
//     <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
//       <div
//         style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
//       >
//         <ResponsivePie
//           data={
//             data.length > 0
//               ? data
//               : [{ id: "No Data", label: "No Data", value: 1 }]
//           }
//           margin={{ top: 10, right: 10, bottom: 60, left: 10 }}
//           innerRadius={0.65}
//           padAngle={0.7}
//           cornerRadius={3}
//           activeOuterRadiusOffset={8}
//           colors={{ scheme: "set2" }}
//           borderWidth={1}
//           borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
//           enableArcLabels={data.length > 0}
//           arcLabelsComponent={({ datum, style }) => (
//             <g transform={style.transform} style={{ pointerEvents: "none" }}>
//               <text
//                 textAnchor="middle"
//                 dominantBaseline="central"
//                 style={{
//                   fill: "black",
//                   fontSize: "12px",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {`${((datum.value / totalItems) * 100).toFixed(0)}%`}
//               </text>
//             </g>
//           )}
//           tooltip={({ datum }) => (
//             <div
//               style={{
//                 background: "rgba(255, 255, 255, 0.95)",
//                 padding: "9px 12px",
//                 border: "1px solid #ccc",
//                 fontSize: "14px",
//                 boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//               }}
//             >
//               <strong>{datum.label}</strong>
//               <br />
//               Items: {datum.value}
//               <br />
//               Share:{" "}
//               {totalItems > 0
//                 ? ((datum.value / totalItems) * 100).toFixed(1)
//                 : 0}
//               %
//             </div>
//           )}
//           legends={[
//             {
//               anchor: "bottom",
//               direction: "row",
//               justify: false,
//               translateX: 0,
//               translateY: 50,
//               itemsSpacing: 10,
//               itemWidth: 90,
//               itemHeight: 18,
//               itemTextColor: "#555",
//               symbolSize: 12,
//               symbolShape: "circle",
//               effects: [
//                 {
//                   on: "hover",
//                   style: { itemTextColor: "#000" },
//                 },
//               ],
//             },
//           ]}
//         />
//       </div>
//     </div>
//   );
// };

// export default StudentTypeDonut;
