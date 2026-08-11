import { describe, it, expect } from "vitest";
import dayjs from "dayjs";

describe("Menu Schedule Date Rules & Cascading Invariants", () => {
  describe("Schedule date classification (Future vs Today vs Past)", () => {
    it("should classify schedule dates correctly for inventory refund rules", () => {
      const today = dayjs().startOf("day");
      const tomorrow = dayjs().add(1, "day").startOf("day");
      const yesterday = dayjs().subtract(1, "day").startOf("day");

      // Tomorrow is future -> deactivating item refunds reserved ingredients to inventory
      expect(tomorrow.isAfter(today)).toBe(true);

      // Today is not future -> deactivating item hides it but does not refund (waste)
      expect(today.isAfter(today)).toBe(false);

      // Yesterday is not future -> cannot refund
      expect(yesterday.isAfter(today)).toBe(false);
    });
  });

  describe("Ingredient shortage error parsing on schedule item addition", () => {
    it("should parse single food shortage error string", () => {
      const errorMsg = 'Insufficient ingredients: "Phở Bò": "Thịt Bò" - Required: 5.0 kg, Available: 2.0 kg, Shortage: 3.0 kg';
      
      const content = errorMsg.replace("Insufficient ingredients: ", "");
      const foodBlocks = content.split(" | ");
      
      const shortages = [];
      for (const block of foodBlocks) {
        const foodMatch = block.match(/^"([^"]+)":/);
        if (!foodMatch) continue;
        const foodName = foodMatch[1];
        const ingredientsContent = block.replace(/^"([^"]+)":\s*/, "");
        const ingredientItems = ingredientsContent.split("; ");
        
        for (const item of ingredientItems) {
          const match = item.match(/"([^"]+)" - Required: ([\d.]+) (\w+), Available: ([\d.]+) (\w+), Shortage: ([\d.]+) (\w+)/);
          if (match) {
            shortages.push({
              food: foodName,
              ingredient: match[1],
              required: match[2],
              available: match[4],
              shortage: match[6],
              unit: match[3],
            });
          }
        }
      }

      expect(shortages.length).toBe(1);
      expect(shortages[0].food).toBe("Phở Bò");
      expect(shortages[0].ingredient).toBe("Thịt Bò");
      expect(shortages[0].shortage).toBe("3.0");
      expect(shortages[0].unit).toBe("kg");
    });
  });
});
