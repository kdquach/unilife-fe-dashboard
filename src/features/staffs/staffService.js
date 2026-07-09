import apiClient from "../../services/apiClient";

export const staffService = {
  async getStaffs(params = {}) {
    const response = await apiClient.get("/users/staffs", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getStaffById(id) {
    const response = await apiClient.get(`/users/staffs/${id}`);

    return response.data;
  },
};
