import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { formatDateTime, formatDate } from "../../../utils/format";

dayjs.extend(utc);
dayjs.extend(timezone);

describe("Ingredient Expiry, Timezone & Batch Cascades", () => {
  describe("Batch expiration checks", () => {
    it("should correctly identify expired batches strictly after the day ends", () => {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const today = dayjs().format("YYYY-MM-DD");
      const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

      // Yesterday is expired
      expect(dayjs(yesterday).endOf("day").isBefore(dayjs())).toBe(true);

      // Today is NOT yet expired (valid until 23:59:59)
      expect(dayjs(today).endOf("day").isBefore(dayjs())).toBe(false);

      // Tomorrow is NOT expired
      expect(dayjs(tomorrow).endOf("day").isBefore(dayjs())).toBe(false);
    });

    it("should sort batches by FEFO (First-Expired First-Out)", () => {
      const batches = [
        { _id: "b3", expiryDate: "2026-10-01", remainingQuantity: 10 },
        { _id: "b1", expiryDate: "2026-08-15", remainingQuantity: 5 },
        { _id: "b2", expiryDate: "2026-09-01", remainingQuantity: 20 },
      ];

      const sorted = [...batches].sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );

      expect(sorted[0]._id).toBe("b1");
      expect(sorted[1]._id).toBe("b2");
      expect(sorted[2]._id).toBe("b3");
    });
  });

  describe("Timezone consistency (Asia/Ho_Chi_Minh)", () => {
    it("should format UTC timestamps correctly into Vietnam time", () => {
      // 2026-08-11 00:00:00 UTC is 2026-08-11 07:00:00 in Vietnam (GMT+7)
      const utcTime = "2026-08-11T00:00:00.000Z";
      const formatted = formatDateTime(utcTime);

      expect(formatted).toBe("11/08/2026 07:00");
    });

    it("should format date-only strings without timezone day-shift glitches", () => {
      const dateStr = "2026-08-11";
      const formatted = formatDate(dateStr);

      expect(formatted).toBe("11/08/2026");
    });
  });
});
