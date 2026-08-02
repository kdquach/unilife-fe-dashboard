import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
} from "antd";

import { notify } from "../utils/notify";

import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import PeakHourSummaryCards from "../features/reports/peakHour/PeakHourSummaryCards";
import PeakHourBarChart from "../features/reports/peakHour/PeakHourBarChart";
import PeakHourDetailDrawer from "../features/reports/peakHour/PeakHourDetailDrawer";

import { reportService } from "../features/reports/reportService";

export default function PeakHourReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [peakHours, setPeakHours] = useState([]);

  const [selectedHour, setSelectedHour] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: "daily",
    month: dayjs(),
    year: dayjs(),
    from: null,
    to: null,
  });

  const usingRangeFilter = filters.from || filters.to;

  const fetchPeakHourReport = async (
    currentFilters = filters
  ) => {
    try {
      setLoading(true);

      const params = {};

      if (currentFilters.type) {
        params.type = currentFilters.type;
      }

      if (currentFilters.from && currentFilters.to) {
        params.from = dayjs(currentFilters.from).format(
          "YYYY-MM-DD"
        );

        params.to = dayjs(currentFilters.to).format(
          "YYYY-MM-DD"
        );
      } else {
        if (
          currentFilters.type === "daily" &&
          currentFilters.month
        ) {
          params.month =
            dayjs(currentFilters.month).month() + 1;

          params.year = dayjs(currentFilters.month).year();
        }

        if (
          currentFilters.type === "monthly" &&
          currentFilters.year
        ) {
          params.year = dayjs(currentFilters.year).year();
        }
      }

      const response =
        await reportService.getPeakHourReport(params);

        console.log(response);
console.log(response.summary);
      setSummary(response.summary);

      setPeakHours(response.peakHours);
    } catch (err) {
      console.log(err);

      notify.error("Cannot load peak hour report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeakHourReport();
  }, []);

  const handleSearch = () => {
    if (
      filters.type === "daily" &&
      !filters.month &&
      !(filters.from && filters.to)
    ) {
      return notify.warning(
        "Please select a month."
      );
    }

    if (
      filters.type === "monthly" &&
      !filters.year &&
      !(filters.from && filters.to)
    ) {
      return notify.warning(
        "Please select a year."
      );
    }

    fetchPeakHourReport(filters);
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

    fetchPeakHourReport(reset);
  };

  const columns = [
    {
      title: "Hour",
      dataIndex: "hour",
      render: (value) =>
        `${String(value).padStart(2, "0")}:00`,
    },
    {
      title: "Orders",
      dataIndex: "orders",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      render: (value) =>
        new Intl.NumberFormat("vi-VN").format(value) +
        " ₫",
    },
  ];

    return (
    <div>
      <PageHeader
        title="Peak Hour Report"
        description="Business peak hour analytics"
        breadcrumbs={[
          "Dashboard",
          "Reports",
          "Peak Hour Report",
        ]}
      />

      <PeakHourSummaryCards summary={summary} />

      <Card
        title="Peak Hour Report"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
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
              placeholder={
                filters.type === "daily"
                  ? "Select month"
                  : "Select year"
              }
              onChange={(value) => {
                if (filters.type === "daily") {
                  setFilters({
                    ...filters,
                    month: value,
                    from: null,
                    to: null,
                  });
                } else if (
                  filters.type === "monthly"
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
        <PeakHourBarChart
          data={peakHours}
          onBarClick={(item) => {
            setSelectedHour(item);
            setDrawerOpen(true);
          }}
        />

                <Table
          style={{ marginTop: 24 }}
          rowKey="hour"
          loading={loading}
          columns={columns}
          dataSource={peakHours}
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              setSelectedHour(record);
              setDrawerOpen(true);
            },
            style: {
              cursor: "pointer",
            },
          })}
        />

        <PeakHourDetailDrawer
          open={drawerOpen}
          data={selectedHour}
          maxOrders={summary.maxOrders}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedHour(null);
          }}
        />
      </Card>
    </div>
  );
}