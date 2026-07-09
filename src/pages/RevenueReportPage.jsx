import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  message,
} from "antd";

import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import RevenueSummaryCards from "../features/reports/RevenueSummaryCards";
import RevenueTrendChart from "../features/reports/RevenueTrendChart";
import { reportService } from "../features/reports/reportService";

const { RangePicker } = DatePicker;

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [revenue, setRevenue] = useState([]);

  const [filters, setFilters] = useState({
    type: "daily",
    from: null,
    to: null,
  });

  const fetchRevenueReport = async (
    currentFilters = filters
  ) => {
    try {
      setLoading(true);

      const params = {};

      if (currentFilters.type)
        params.type = currentFilters.type;

      if (currentFilters.from)
        params.from = dayjs(currentFilters.from).format(
          "YYYY-MM-DD"
        );

      if (currentFilters.to)
        params.to = dayjs(currentFilters.to).format(
          "YYYY-MM-DD"
        );

      const response =
        await reportService.getRevenueReport(params);

      setSummary(response.summary);

      setRevenue(response.revenue);
    } catch (err) {
      console.log(err);

      message.error("Cannot load revenue report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const columns = [
    {
      title: "Period",
      dataIndex: "_id",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      render: (value) => formatMoney(value),
    },
    {
      title: "Orders",
      dataIndex: "orders",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Revenue Report"
        description="Business revenue analytics"
        breadcrumbs={[
          "Dashboard",
          "Reports",
          "Revenue Report",
        ]}
      />

      <RevenueSummaryCards summary={summary} />

      <Card
        className="dashboard-card mb-5"
        title="Revenue Report"
        extra={
          <Space wrap>
            <Select
              style={{
                width: 160,
              }}
              value={filters.type}
              options={[
                {
                  label: "Daily",
                  value: "daily",
                },
                {
                  label: "Monthly",
                  value: "monthly",
                },
                {
                  label: "Yearly",
                  value: "yearly",
                },
              ]}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  type: value,
                })
              }
            />

            <RangePicker
              value={[
                filters.from,
                filters.to,
              ]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  from: dates?.[0] || null,
                  to: dates?.[1] || null,
                });
              }}
            />

            <Button
              type="primary"
              onClick={() =>
                fetchRevenueReport(filters)
              }
            >
              Search
            </Button>

            <Button
              onClick={() => {
                const reset = {
                  type: "daily",
                  from: null,
                  to: null,
                };

                setFilters(reset);

                fetchRevenueReport(reset);
              }}
            >
              Reset
            </Button>
          </Space>
        }
      >
        <RevenueTrendChart data={revenue} />

        <Table
          style={{
            marginTop: 24,
          }}
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={revenue}
          pagination={false}
        />
      </Card>
    </div>
  );
}