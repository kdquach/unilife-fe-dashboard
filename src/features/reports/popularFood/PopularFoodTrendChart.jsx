import React from "react";
import { Bar } from "@ant-design/plots";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PopularFoodTrendChart({
  data = [],
  onBarClick,
}) {
  const chartData = [...data].sort(
    (a, b) => b.totalSold - a.totalSold
  );

  const config = {
    data: chartData,

    xField: "foodName",

    yField: "totalSold",

    seriesField: "foodName",

    columnWidthRatio: 0.6,

    autoFit: true,

    appendPadding: [20, 20, 40, 20],

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
          `Sold : ${datum.totalSold}\n` +
          `Revenue : ${formatMoney(datum.revenue)}`,
      }),
    },

    interactions: [],

    animation: false,

    onReady: (plot) => {
      plot.on("element:click", (evt) => {
        const item = evt.data?.data;

        if (item && onBarClick) {
          onBarClick(item);
        }
      });
    },
  };

  return (
    <Bar
      {...config}
      height={380}
    />
  );
}