import React, { useEffect, useState } from "react";
import { Card, Table, Select, DatePicker, Button, Space, message } from "antd";

import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import RevenueSummaryCards from "../features/reports/RevenueSummaryCards";
import RevenueTrendChart from "../features/reports/RevenueTrendChart";
import { reportService } from "../features/reports/reportService";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [revenue, setRevenue] = useState([]);

  const [filters, setFilters] = useState({
    type: "daily",
    month: dayjs(),
    year: dayjs(),
    from: null,
    to: null,
  });

  const usingRangeFilter = filters.from || filters.to;

  const fetchRevenueReport = async (currentFilters = filters) => {
    try {
      setLoading(true);

      const params = {};

      if (currentFilters.type) {
        params.type = currentFilters.type;
      }

      if (currentFilters.from && currentFilters.to) {
        params.from = dayjs(currentFilters.from).format("YYYY-MM-DD");
        params.to = dayjs(currentFilters.to).format("YYYY-MM-DD");
      } else {
        if (currentFilters.type === "daily" && currentFilters.month) {
          params.from = dayjs(currentFilters.month)
            .startOf("month")
            .format("YYYY-MM-DD");

          params.to = dayjs(currentFilters.month)
            .endOf("month")
            .format("YYYY-MM-DD");
        }

        if (currentFilters.type === "monthly" && currentFilters.year) {
          params.from = dayjs(currentFilters.year)
            .startOf("year")
            .format("YYYY-MM-DD");

          params.to = dayjs(currentFilters.year)
            .endOf("year")
            .format("YYYY-MM-DD");
        }
      }

      const response = await reportService.getRevenueReport(params);

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

  const handleSearch = () => {
    if (
      filters.type === "daily" &&
      !filters.month &&
      !(filters.from && filters.to)
    ) {
      return message.warning("Please select a month to view daily report.");
    }

    if (
      filters.type === "monthly" &&
      !filters.year &&
      !(filters.from && filters.to)
    ) {
      return message.warning("Please select a year to view monthly report.");
    }

    fetchRevenueReport(filters);
  };

  const handleReset = () => {
    const reset = {
      type: "daily",
      month: dayjs(),
      year: dayjs(),
      from: null,
      to: null,
    };

    setFilters(reset);

    fetchRevenueReport(reset);
  };

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
        breadcrumbs={["Dashboard", "Reports", "Revenue Report"]}
      />

      <RevenueSummaryCards summary={summary} />

      <Card
        className="dashboard-card mb-5"
        title="Revenue Report"
        extra={
          <Space wrap>
            <Select
              disabled={usingRangeFilter}
              style={{ width: 150 }}
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
              onChange={(value) => {
                if (value === "daily") {
                  setFilters({
                    ...filters,
                    type: "daily",
                    month: filters.month ?? dayjs(),
                    year: dayjs(),
                    from: null,
                    to: null,
                  });
                } else if (value === "monthly") {
                  setFilters({
                    ...filters,
                    type: "monthly",
                    year: filters.year ?? dayjs(),
                    from: null,
                    to: null,
                  });
                } else {
                  setFilters({
                    ...filters,
                    type: "yearly",
                    year: null,
                    from: null,
                    to: null,
                  });
                }
              }}
            />

            <DatePicker
              picker={filters.type === "daily" ? "month" : "year"}
              allowClear={false}
              placeholder={
                filters.type === "daily"
                  ? "Select month"
                  : filters.type === "monthly"
                    ? "Select year"
                    : "Select year"
              }
              disabled={usingRangeFilter || filters.type === "yearly"}
              value={filters.type === "daily" ? filters.month : filters.year}
              onChange={(value) => {
                if (filters.type === "daily") {
                  setFilters({
                    ...filters,
                    month: value,
                    from: null,
                    to: null,
                  });
                } else if (filters.type === "monthly") {
                  setFilters({
                    ...filters,
                    year: value,
                    from: null,
                    to: null,
                  });
                }
              }}
            />

            <Space>
              <DatePicker
                placeholder="From"
                value={filters.from}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    from: value,

                    month: null,
                    year: null,
                  })
                }
              />

              <DatePicker
                placeholder="To"
                value={filters.to}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    to: value,

                    month: null,
                    year: null,
                  })
                }
              />
            </Space>

            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>

            <Button onClick={handleReset}>Reset</Button>
          </Space>
        }
      >
        <RevenueTrendChart data={revenue} />

        <Table
          style={{ marginTop: 24 }}
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
