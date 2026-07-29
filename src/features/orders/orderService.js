import apiClient from "../../services/apiClient";

export const orderService = {
  async getOrders(params = {}) {
    const response = await apiClient.get("/orders", {
      params,
    });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async createWalkInOrder(payload) {
    const response = await apiClient.post(
      "/orders/walk-in",
      payload
    );

    return response.data;
  },

  async scanPickupQr(payload) {
    // Format payload according to API requirement
    let formattedPayload;
    
    if (payload.orderCode) {
      // Send orderCode directly as requested by backend
      formattedPayload = { orderCode: payload.orderCode };
    } else if (payload.qrPayload) {
      try {
        const parsed = JSON.parse(payload.qrPayload);
        // If it's already a valid JSON object with the expected structure
        if (parsed.type && (parsed.orderId || parsed.orderCode)) {
          formattedPayload = { qrPayload: payload.qrPayload };
        } else if (parsed.orderId || parsed.orderCode) {
          // If it has orderId or orderCode but missing type, add it
          formattedPayload = { 
            qrPayload: JSON.stringify({
              type: "UNILIFE_PICKUP",
              ...parsed
            })
          };
        } else {
          // If it's just a string (like "338467"), treat it as orderCode
          formattedPayload = { 
            qrPayload: JSON.stringify({
              type: "UNILIFE_PICKUP",
              orderCode: payload.qrPayload
            })
          };
        }
      } catch (e) {
        // If it's not valid JSON, treat it as orderCode
        formattedPayload = { 
          qrPayload: JSON.stringify({
            type: "UNILIFE_PICKUP",
            orderCode: payload.qrPayload
          })
        };
      }
    } else {
      throw new Error("Order ID, order code or QR payload is required");
    }

    console.log("Sending payload:", formattedPayload);
    const response = await apiClient.post("/orders/scan-pickup-qr", formattedPayload);

    return response.data;
  },
};
