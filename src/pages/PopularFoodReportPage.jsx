import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import PopularFoodSummaryCards from "../features/reports/popularFood/PopularFoodSummaryCards";
import PopularFoodBarChart from "../features/reports/popularFood/PopularFoodBarChart";
import PopularFoodTable from "../features/reports/popularFood/PopularFoodTable";
import PopularFoodDetailDrawer from "../features/reports/popularFood/PopularFoodDetailDrawer";

import { reportService } from "../features/reports/reportService";
import { notify } from "../utils/notify";

export default function PopularFoodReportPage() {
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});

  const [foods, setFoods] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedFood, setSelectedFood] = useState(null);

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
          params.month =
            dayjs(currentFilters.month).month() + 1;

          params.year =
            dayjs(currentFilters.month).year();
        }

        if (currentFilters.type === "monthly") {
          params.year =
            dayjs(currentFilters.year).year();
        }
      }

      const response =
        await reportService.getPopularFoodReport(params);

      setSummary(response.summary);

      setFoods(response.foods);
    } catch (err) {
      console.log(err);

      notify.error(
        "Cannot load popular food report."
      );
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

  const totalSold = foods.reduce(
    (sum, item) => sum + item.totalSold,
    0,
  );

  return (
    <div>
      <PageHeader
        title="Popular Food Report"
        description="Popular food analytics"
        breadcrumbs={[
          "Dashboard",
          "Reports",
          "Popular Food Report",
        ]}
      />

      <PopularFoodSummaryCards
        summary={summary}
      />

      <Card
        className="dashboard-card mb-5"
        title="Popular Food Report"
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
                    month:
                      filters.month ?? dayjs(),
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
                      filters.year ?? dayjs(),
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

            <Button
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>
        }
      >
        <PopularFoodBarChart
          data={foods}
          onBarClick={(item) => {
            setSelectedFood(item);
            setDrawerOpen(true);
          }}
        />

        <PopularFoodTable
          loading={loading}
          data={foods}
          onRowClick={(record) => {
            setSelectedFood(record);
            setDrawerOpen(true);
          }}
        />

        <PopularFoodDetailDrawer
          open={drawerOpen}
          data={selectedFood}
          totalSold={totalSold}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedFood(null);
          }}
        />
      </Card>
    </div>
  );
}