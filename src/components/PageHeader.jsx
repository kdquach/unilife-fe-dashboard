import React from "react";
import { Breadcrumb, Typography } from "antd";

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  extra,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <Breadcrumb
            className="mb-3"
            items={breadcrumbs.map((item) => ({ title: item }))}
          />
        )}
        <Typography.Title level={2} className="!mb-2 !text-slate-900">
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph className="!mb-0 !text-slate-500">
            {description}
          </Typography.Paragraph>
        )}
      </div>
      {extra && <div className="flex items-center gap-3">{extra}</div>}
    </div>
  );
}
