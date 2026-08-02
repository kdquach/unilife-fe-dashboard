import React, { useEffect, useState } from "react";
import { Card, Select, DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import OrderStatisticsSummaryCards from "../features/reports/orderStatistics/OrderStatisticsSummaryCards";
import OrderStatisticsPieChart from "../features/reports/orderStatistics/OrderStatisticsPieChart";
import OrderStatisticsTable from "../features/reports/orderStatistics/OrderStatisticsTable";
import OrderStatisticsDetailDrawer from "../features/reports/orderStatistics/OrderStatisticsDetailDrawer";

import { reportService } from "../features/reports/reportService";
import { notify } from "../utils/notify";

export default function OrderStatisticsReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [statistics, setStatistics] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);

  const [filters, setFilters] = useState({
    type: "daily",
    month: dayjs(),
    year: dayjs(),
    from: null,
    to: null,
  });

  const usingRangeFilter = filters.from || filters.to;

  const fetchReport = async (currentFilters = filters) => {
    try {
      setLoading(true);

      const params = {};

      params.type = currentFilters.type;

      if (currentFilters.from && currentFilters.to) {
        params.from = dayjs(currentFilters.from).format("YYYY-MM-DD");

        params.to = dayjs(currentFilters.to).format("YYYY-MM-DD");
      } else {
        if (currentFilters.type === "daily") {
          params.month = dayjs(currentFilters.month).month() + 1;

          params.year = dayjs(currentFilters.month).year();
        }

        if (currentFilters.type === "monthly") {
          params.year = dayjs(currentFilters.year).year();
        }
      }

      const response = await reportService.getOrderStatisticsReport(params);

      setSummary(response.summary);

      setStatistics(response.statistics);
    } catch (err) {
      console.log(err);

      notify.error("Cannot load order statistics report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSearch = () => {
    if (
      filters.type === "daily" &&
      !filters.month &&
      !(filters.from && filters.to)
    ) {
      return notify.warning("Please select a month.");
    }

    if (
      filters.type === "monthly" &&
      !filters.year &&
      !(filters.from && filters.to)
    ) {
      return notify.warning("Please select a year.");
    }

    fetchReport(filters);
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

    fetchReport(reset);
  };

  return (
    <div>
      <PageHeader
        title="Order Statistics Report"
        description="Order status analytics"
        breadcrumbs={["Dashboard", "Reports", "Order Statistics"]}
      />

      <OrderStatisticsSummaryCards summary={summary} />

      <Card
        title="Order Statistics"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
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
              picker={filters.type === "daily" ? "month" : "year"}
              allowClear={false}
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

            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>

            <Button onClick={handleReset}>Reset</Button>
          </Space>
        }
      >
        <OrderStatisticsPieChart
          data={statistics}
          onSliceClick={(item) => {
            console.log("ITEM:", item);
            setSelectedStatus(item);
            setDrawerOpen(true);
          }}
        />

        <OrderStatisticsTable
          loading={loading}
          data={statistics}
          onRowClick={(record) => {
            setSelectedStatus(record);
            setDrawerOpen(true);
          }}
        />

        <OrderStatisticsDetailDrawer
          open={drawerOpen}
          data={selectedStatus}
          totalOrders={summary.totalOrders}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedStatus(null);
          }}
        />
      </Card>
    </div>
  );
}
