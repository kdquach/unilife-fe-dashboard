import React from "react";
import { Card } from "antd";
import {
  StarOutlined,
  TrophyOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import { COLORS } from "../../orders/utils/orderUtils.jsx";

/**
 * Summary cards showing ratings statistics
 */
export default function RatingsSummaryCards({ ratings }) {
  const total = ratings.length;
  const fiveStars = ratings.filter((r) => r.rating === 5).length;
  const fourStars = ratings.filter((r) => r.rating === 4).length;
  const oneToThreeStars = ratings.filter((r) => r.rating >= 1 && r.rating <= 3).length;

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.orange}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">On Page</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
              {total}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${COLORS.orange}1a`,
              color: COLORS.orange,
              fontSize: 18,
            }}
          >
            <StarOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.green}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">5 Stars</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
              {fiveStars}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${COLORS.green}1a`,
              color: COLORS.green,
              fontSize: 18,
            }}
          >
            <TrophyOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.blue}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">4 Stars</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.blue }}>
              {fourStars}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${COLORS.blue}1a`,
              color: COLORS.blue,
              fontSize: 18,
            }}
          >
            <LikeOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.red}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">1-3 Stars</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
              {oneToThreeStars}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${COLORS.red}1a`,
              color: COLORS.red,
              fontSize: 18,
            }}
          >
            <DislikeOutlined />
          </div>
        </div>
      </Card>
    </div>
  );
}
