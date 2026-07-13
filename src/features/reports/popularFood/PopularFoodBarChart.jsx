import React from "react";
import { Column } from "@ant-design/plots";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PopularFoodBarChart({
  data = [],
}) {
  const chartData = [...data].sort(
    (a, b) => b.totalSold - a.totalSold,
  );

  const config = {
    data: chartData,

    xField: "foodName",

    yField: "totalSold",

    style: {
    maxWidth: 50,
  },

    columnWidthRatio: 0.55,

    autoFit: true,

    appendPadding: [20, 20, 30, 20],

    xAxis: {
      label: {
        autoRotate: false,
        autoHide: false,
      },
    },

    yAxis: {
      nice: true,
    },

    meta: {
      foodName: {
        alias: "Food",
      },
      totalSold: {
        alias: "Sold",
      },
    },

    label: {
      position: "top",
      content: (item) => `${item.totalSold}`,
      style: {
        fill: "#333",
        fontSize: 12,
      },
    },

    tooltip: {
      title: (datum) => datum.foodName,

      formatter: (datum) => ({
        name: "Statistics",
        value:
          `Sold: ${datum.totalSold}\n` +
          `Revenue: ${formatMoney(datum.revenue)}`,
      }),
    },

    interactions: [
      {
        type: "element-active",
      },
    ],

    animation: false,
  };

  return (
    <Column
      {...config}
      height={380}
    />
  );
}