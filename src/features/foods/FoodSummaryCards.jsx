import React from "react";
import { Card } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";

export default function FoodSummaryCards({ stats }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="dashboard-card">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
            <AppstoreOutlined />
          </div>

          <div>
            <div className="text-sm text-slate-500">
              Foods
            </div>

            <div className="text-2xl font-bold">
              {stats.total}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-slate-500">
          Active on Page
        </div>

        <div className="text-2xl font-bold text-green-600">
          {stats.active}
        </div>
      </Card>

      <Card>
        <div className="text-sm text-slate-500">
          Inactive on Page
        </div>

        <div className="text-2xl font-bold text-red-600">
          {stats.inactive}
        </div>
      </Card>

      <Card>
        <div className="text-sm text-slate-500">
          Menu Items on Page
        </div>

        <div className="text-2xl font-bold text-purple-600">
          {stats.menuItems}
        </div>
      </Card>
    </div>
  );
}