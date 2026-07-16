import React from "react";
import { Column } from "@ant-design/plots";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PeakHourTrendChart({
  data = [],
  onBarClick,
}) {
  const chartData = data
    .map((item) => ({
      ...item,
      hourLabel: `${String(item.hour).padStart(2, "0")}:00`,
    }))
    .sort((a, b) => a.hour - b.hour);

  const config = {
    data: chartData,

    xField: "hourLabel",

    yField: "orders",

    columnWidthRatio: 0.55,

    autoFit: true,

    appendPadding: [20, 20, 30, 20],

    xAxis: {
      type: "cat",
      tickLine: null,
      label: {
        autoRotate: false,
        autoHide: false,
      },
    },

    yAxis: {
      nice: true,
    },

    meta: {
      hourLabel: {
        alias: "Hour",
      },
      orders: {
        alias: "Orders",
      },
    },

    label: {
      content: (item) => `${item.orders}`,
      position: "top",
      style: {
        fill: "#333",
        fontSize: 12,
      },
    },

    tooltip: {
  title: (datum) => `🕐 ${datum.hourLabel}`,

  formatter: (datum) => ({
    name: "Statistics",
    value:
      `Orders : ${datum.orders}\n` +
      `Revenue : ${new Intl.NumberFormat("vi-VN").format(
        datum.revenue
      )} ₫`,
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
    <Column
      {...config}
      height={380}
    />
  );
}