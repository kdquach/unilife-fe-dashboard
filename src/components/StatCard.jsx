import React from "react";
import { Card, Statistic } from "antd";

export default function StatCard({ title, value, prefix, valueStyle }) {
  return (
    <Card className="dashboard-card" styles={{ body: { padding: 20 } }}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        valueStyle={valueStyle}
      />
    </Card>
  );
}
