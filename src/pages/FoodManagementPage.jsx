import React, { useState, useEffect } from "react";
import { Button, Card, Input, Select, Space } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

// Components
import FoodSummaryCards from "../features/foods/FoodSummaryCards";
import FoodTable from "../features/foods/FoodTable";
import FoodDetailDrawer from "../features/foods/FoodDetailDrawer";
import FoodFormModal from "../features/foods/FoodFormModal";

// Hooks
import { useFoods } from "../features/foods/hooks/useFoods";

// Services
import { foodCategoryService } from "../features/foodCategories/foodCategoryService";
import { ingredientService } from "../features/ingredients/ingredientService";

const { Search } = Input;

const getRecordId = (record) =>
  record?._id || record?.id || record?.foodId;

export default function FoodManagementPage() {
  // Local state for modals and selection
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingFood, setEditingFood] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    categoryId: undefined,
    isActive: undefined,
    isMenuItem: undefined,
  });

  // Custom hook
  const { foods, loading, saving, pagination, fetchFoods, createFood, updateFood, getFoodById } = useFoods();

  // Initial data fetch
  useEffect(() => {
    fetchFoods({ page: 1, pageSize: 10 });
    fetchCategories();
    fetchIngredients();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await foodCategoryService.getFoodCategories({
        page: 1,
        limit: 100,
        isActive: true,
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error(err.message || "Cannot load food categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      setIngredientLoading(true);
      const response = await ingredientService.getIngredients({
        page: 1,
        limit: 100,
        isActive: true,
      });
      setIngredients(response.data || []);
    } catch (err) {
      console.error(err.message || "Cannot load ingredients");
    } finally {
      setIngredientLoading(false);
    }
  };

  const stats = {
    total: pagination.total || foods.length,
    active: foods.filter((food) => food.isActive).length,
    inactive: foods.length - foods.filter((food) => food.isActive).length,
    menuItems: foods.filter((food) => food.isMenuItem).length,
  };

  const categoryOptions = categories.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchFoods({
      page: 1,
      pageSize: pagination.pageSize,
      searchKeyword: keyword,
      nextFilters,
    });
  };

  const handleSearch = (value) => {
    setKeyword(value);
    fetchFoods({
      page: 1,
      pageSize: pagination.pageSize,
      searchKeyword: value,
      nextFilters: filters,
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchFoods({
      page,
      pageSize,
      searchKeyword: keyword,
      nextFilters: filters,
    });
  };

  const openDetailDrawer = async (record) => {
    setSelectedFood(record);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const detail = await getFoodById(getRecordId(record));
      setSelectedFood(detail);
    } catch (err) {
      console.error(err.message || "Cannot load food detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditModal = async (record) => {
    try {
      setActionLoadingId(getRecordId(record));
      const detail = await getFoodById(getRecordId(record));
      setEditingFood(detail);
      setFormMode("edit");
      setFormOpen(true);
    } catch (err) {
      console.error(err.message || "Cannot load food detail");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingFood(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingFood(null);
    setFormMode("create");
  };

  const handleSubmitFood = async (values) => {
    try {
      if (formMode === "create") {
        await createFood(values);
      } else {
        await updateFood(getRecordId(editingFood), values);
      }

      closeFormModal();

      fetchFoods({
        page: formMode === "create" ? 1 : pagination.current,
        pageSize: pagination.pageSize,
        searchKeyword: keyword,
        nextFilters: filters,
      });
    } catch (err) {
      console.error(err.message || "Cannot save food");
    }
  };

    return (
      <div>
        <PageHeader
          title="Food Management"
          breadcrumbs={["Dashboard", "Foods"]}
          extra={
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchFoods({
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                  })
                }
              >
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Create Food
              </Button>
            </Space>
          }
        />

        <FoodSummaryCards stats={stats} />

        <Card
          title="Food Items"
          style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
          extra={
            <Space wrap>
              <Search
                placeholder="Search food..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 280 }}
                onSearch={handleSearch}
              />

              <Select
                allowClear
                showSearch
                loading={categoryLoading}
                placeholder="Category"
                style={{ width: 190 }}
                options={categoryOptions}
                optionFilterProp="label"
                onChange={(value) => handleFilterChange("categoryId", value)}
              />

              <Select
                allowClear
                placeholder="Type"
                style={{ width: 150 }}
                options={[
                  {
                    label: "Daily",
                    value: false,
                  },
                  {
                    label: "Menu Item",
                    value: true,
                  },
                ]}
                onChange={(value) => handleFilterChange("isMenuItem", value)}
              />

              <Select
                allowClear
                placeholder="Status"
                style={{ width: 140 }}
                options={[
                  {
                    label: "Active",
                    value: true,
                  },
                  {
                    label: "Inactive",
                    value: false,
                  },
                ]}
                onChange={(value) => handleFilterChange("isActive", value)}
              />
            </Space>
          }
        >
          <FoodTable
            loading={loading}
            foods={foods}
            pagination={pagination}
            actionLoadingId={actionLoadingId}
            onView={openDetailDrawer}
            onEdit={openEditModal}
            onPageChange={handlePaginationChange}
          />
        </Card>

        <FoodDetailDrawer
          open={detailOpen}
          loading={detailLoading}
          food={selectedFood}
          onClose={() => setDetailOpen(false)}
        />

        <FoodFormModal
          open={formOpen}
          mode={formMode}
          initialValues={editingFood}
          categories={categories}
          ingredients={ingredients}
          categoryLoading={categoryLoading}
          ingredientLoading={ingredientLoading}
          loading={saving}
          onCancel={closeFormModal}
          onSubmit={handleSubmitFood}
        />
      </div>
  );
}

