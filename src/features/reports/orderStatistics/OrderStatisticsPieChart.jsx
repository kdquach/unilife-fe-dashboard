import React from "react";
import { Pie } from "@ant-design/plots";

export default function OrderStatisticsPieChart({ data = [], onSliceClick }) {
  const chartData = data.map((item) => ({
    ...item,
    status: item._id,
  }));

  const config = {
    data: chartData,

    angleField: "orders",

    colorField: "status",

    radius: 0.9,

    innerRadius: 0.5,

    label: false,

    legend: {
      position: "bottom",
    },

    tooltip: {
      title: (d) => d.status,
      items: [
        (d) => ({
          name: "Orders",
          value: d.orders,
        }),
        (d) => ({
          name: "Percentage",
          value: `${d.percentage}%`,
        }),
      ],
    },

    interactions: [
      {
        type: "element-active",
      },
    ],

    onReady: (plot) => {
      plot.on("element:click", (evt) => {
        console.log("CLICK:", evt);
        const item = evt.data;

        if (item && onSliceClick) {
          onSliceClick(item);
        }
      });
    },
  };

  return <Pie {...config} height={420} />;
}
