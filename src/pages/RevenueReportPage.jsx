import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";

import { notify } from "../utils/notify";

import PageHeader from "../components/PageHeader";

import RevenueSummaryCards from "../features/reports/revenue/RevenueSummaryCards";
import RevenueTrendChart from "../features/reports/revenue/RevenueTrendChart";
import RevenueTable from "../features/reports/revenue/RevenueTable";
import RevenueDetailDrawer from "../features/reports/revenue/RevenueDetailDrawer";

import { reportService } from "../features/reports/reportService";

export default function RevenueReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [revenue, setRevenue] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedRevenue, setSelectedRevenue] =
    useState(null);

  const [filters, setFilters] = useState({
    type: "daily",
    month: dayjs(),
    year: dayjs(),
    from: null,
    to: null,
  });

  const usingRangeFilter =
    filters.from || filters.to;

  const fetchRevenueReport = async (
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);

      const params = {};

      params.type = currentFilters.type;

      if (
        currentFilters.from &&
        currentFilters.to
      ) {
        params.from = dayjs(
          currentFilters.from,
        ).format("YYYY-MM-DD");

        params.to = dayjs(
          currentFilters.to,
        ).format("YYYY-MM-DD");
      } else {
        if (
          currentFilters.type === "daily"
        ) {
          params.from = dayjs(
            currentFilters.month,
          )
            .startOf("month")
            .format("YYYY-MM-DD");

          params.to = dayjs(
            currentFilters.month,
          )
            .endOf("month")
            .format("YYYY-MM-DD");
        }

        if (
          currentFilters.type ===
          "monthly"
        ) {
          params.from = dayjs(
            currentFilters.year,
          )
            .startOf("year")
            .format("YYYY-MM-DD");

          params.to = dayjs(
            currentFilters.year,
          )
            .endOf("year")
            .format("YYYY-MM-DD");
        }
      }

      const response =
        await reportService.getRevenueReport(
          params,
        );

      setSummary(response.summary);

      setRevenue(response.revenue);
    } catch (err) {
      console.log(err);

      notify.error(
        "Cannot load revenue report.",
      );
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
      return notify.warning(
        "Please select a month.",
      );
    }

    if (
      filters.type === "monthly" &&
      !filters.year &&
      !(filters.from && filters.to)
    ) {
      return notify.warning(
        "Please select a year.",
      );
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
              disabled={usingRangeFilter}
              style={{
                width: 150,
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
              onChange={(value) => {
                if (value === "daily") {
                  setFilters({
                    ...filters,
                    type: "daily",
                    month:
                      filters.month ??
                      dayjs(),
                    from: null,
                    to: null,
                  });
                } else if (
                  value === "monthly"
                ) {
                  setFilters({
                    ...filters,
                    type: "monthly",
                    year:
                      filters.year ??
                      dayjs(),
                    from: null,
                    to: null,
                  });
                } else {
                  setFilters({
                    ...filters,
                    type: "yearly",
                    from: null,
                    to: null,
                  });
                }
              }}
            />

            <DatePicker
              picker={
                filters.type === "daily"
                  ? "month"
                  : "year"
              }
              allowClear={false}
              disabled={
                usingRangeFilter ||
                filters.type === "yearly"
              }
              value={
                filters.type === "daily"
                  ? filters.month
                  : filters.year
              }
              onChange={(value) => {
                if (
                  filters.type === "daily"
                ) {
                  setFilters({
                    ...filters,
                    month: value,
                    from: null,
                    to: null,
                  });
                } else if (
                  filters.type ===
                  "monthly"
                ) {
                  setFilters({
                    ...filters,
                    year: value,
                    from: null,
                    to: null,
                  });
                }
              }}
            />

            <DatePicker
              placeholder="From"
              value={filters.from}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  from: value,
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
                })
              }
            />

            <Button
              type="primary"
              onClick={handleSearch}
            >
              Search
            </Button>

            <Button onClick={handleReset}>
              Reset
            </Button>
          </Space>
        }
      >
        <RevenueTrendChart
          data={revenue}
        />

        <RevenueTable
          loading={loading}
          data={revenue}
          onRowClick={(record) => {
            setSelectedRevenue(record);
            setDrawerOpen(true);
          }}
        />

        <RevenueDetailDrawer
          open={drawerOpen}
          data={selectedRevenue}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedRevenue(null);
          }}
        />
      </Card>
    </div>
  );
}