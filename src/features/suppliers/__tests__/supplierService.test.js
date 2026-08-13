import { describe, it, expect, vi, beforeEach } from "vitest";
import { supplierService } from "../supplierService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("supplierService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get suppliers list and return data and pagination", async () => {
    const mockResponse = {
      data: {
        items: [{ _id: "sup-1", name: "Công ty Nông Sản Sạch" }],
        pagination: { page: 1, limit: 10, total: 1 },
      },
    };
    apiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await supplierService.getSuppliers({ page: 1 });

    expect(apiClient.get).toHaveBeenCalledWith("/suppliers", { params: { page: 1 } });
    expect(result.data).toEqual(mockResponse.data.items);
    expect(result.pagination.total).toBe(1);
  });

  it("should get supplier by id", async () => {
    const mockSup = { _id: "sup-1", name: "Nhà Cung Cấp A" };
    apiClient.get.mockResolvedValueOnce({ data: mockSup });

    const result = await supplierService.getSupplierById("sup-1");

    expect(apiClient.get).toHaveBeenCalledWith("/suppliers/sup-1");
    expect(result).toEqual(mockSup);
  });

  it("should create supplier", async () => {
    const payload = { name: "Nhà Cung Cấp B", phone: "0901234567" };
    apiClient.post.mockResolvedValueOnce({ data: { _id: "sup-2", ...payload } });

    const result = await supplierService.createSupplier(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/suppliers", payload);
    expect(result._id).toBe("sup-2");
  });

  it("should update supplier", async () => {
    const payload = { phone: "0987654321" };
    apiClient.patch.mockResolvedValueOnce({ data: { _id: "sup-1", ...payload } });

    const result = await supplierService.updateSupplier("sup-1", payload);

    expect(apiClient.patch).toHaveBeenCalledWith("/suppliers/sup-1", payload);
    expect(result._id).toBe("sup-1");
  });

  it("should delete supplier", async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { success: true } });

    const result = await supplierService.deleteSupplier("sup-1");

    expect(apiClient.delete).toHaveBeenCalledWith("/suppliers/sup-1");
    expect(result.success).toBe(true);
  });
});
