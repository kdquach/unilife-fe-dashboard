import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
} from "antd";

import PageHeader from "../components/PageHeader";

import FoodSummaryCards from "../features/foods/FoodSummaryCards";
import FoodTable from "../features/foods/FoodTable";
import FoodDetailDrawer from "../features/foods/FoodDetailDrawer";
import FoodFormModal from "../features/foods/FoodFormModal";

import { foodService } from "../features/foods/foodService";
import { foodCategoryService } from "../features/foodCategories/foodCategoryService";
import { ingredientService } from "../features/ingredients/ingredientService";

import { notify } from "../utils/notify";

const { Search } = Input;

const getRecordId = (record) =>
  record?._id || record?.id || record?.foodId;

export default function FoodManagementPage() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [ingredientLoading, setIngredientLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingFood, setEditingFood] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [keyword, setKeyword] = useState("");

  const [filters, setFilters] = useState({
    categoryId: undefined,
    isActive: undefined,
    kind: undefined,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    nextFilters = filters,
  } = {}) => {
    try {
      setLoading(true);

      const response =
        await foodService.getManagedFoods({
          page,
          limit: pageSize,
          keyword: searchKeyword || undefined,
          categoryId: nextFilters.categoryId,
          isActive: nextFilters.isActive,
          kind: nextFilters.kind,
        });

      setFoods(response.data || []);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      notify.error(
        err.message || "Cannot load foods"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const response =
        await foodCategoryService.getFoodCategories({
          page: 1,
          limit: 100,
          isActive: true,
        });

      setCategories(response.data || []);
    } catch (err) {
      notify.warning(
        err.message ||
          "Cannot load food categories"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      setIngredientLoading(true);

      const response =
        await ingredientService.getIngredients({
          page: 1,
          limit: 100,
          isActive: true,
        });

      setIngredients(response.data || []);
    } catch (err) {
      notify.warning(
        err.message ||
          "Cannot load ingredients"
      );
    } finally {
      setIngredientLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods({
      page: 1,
      pageSize: 10,
    });

    fetchCategories();

    fetchIngredients();
  }, []);

  const stats = useMemo(() => {
    const active = foods.filter(
      (food) => food.isActive
    ).length;

    const menuItems = foods.filter(
      (food) => food.isMenuItem
    ).length;

    return {
      total: pagination.total || foods.length,
      active,
      inactive: foods.length - active,
      menuItems,
    };
  }, [foods, pagination.total]);

  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        label: item.name,
        value: item._id,
      })),
    [categories]
  );

  const handleFilterChange = (
    key,
    value
  ) => {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);

    fetchFoods({
      page: 1,
      pageSize: pagination.pageSize,
      nextFilters,
    });
  };

  const fetchFoodDetail = async (
    record
  ) => {
    return await foodService.getManagedFoodById(
      getRecordId(record)
    );
  };

  const openDetailDrawer = async (
    record
  ) => {
    setSelectedFood(record);

    setDetailOpen(true);

    setDetailLoading(true);

    try {
      const detail =
        await fetchFoodDetail(record);

      setSelectedFood(detail);
    } catch (err) {
      notify.error(
        err.message ||
          "Cannot load food detail"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditModal = async (
    record
  ) => {
    try {
      setActionLoadingId(
        getRecordId(record)
      );

      const detail =
        await fetchFoodDetail(record);

      setEditingFood(detail);

      setFormMode("edit");

      setFormOpen(true);
    } catch (err) {
      notify.error(
        err.message ||
          "Cannot load food detail"
      );
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

  const handleSubmitFood = async (
    values
  ) => {
    try {
      setSaving(true);

      if (formMode === "create") {
        await foodService.createFood(values);

        notify.success(
          "Food created successfully"
        );
      } else {
        await foodService.updateFood(
          getRecordId(editingFood),
          values
        );

        notify.success(
          "Food updated successfully"
        );
      }

      closeFormModal();

      fetchFoods({
        page:
          formMode === "create"
            ? 1
            : pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      notify.error(
        err.message ||
          "Cannot save food"
      );
    } finally {
      setSaving(false);
    }
  };

    return (
    <div>
      <PageHeader
        title="Foods"
        description="Manage food items sold by UniLife."
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

      <FoodSummaryCards
        stats={stats}
      />

      <Card
        title="Food Items"
        extra={
          <Space wrap>
            <Search
              placeholder="Search food..."
              allowClear
              style={{ width: 240 }}
              onSearch={(value) => {
                setKeyword(value);

                fetchFoods({
                  page: 1,
                  pageSize: pagination.pageSize,
                  searchKeyword: value,
                });
              }}
            />

            <Select
              allowClear
              showSearch
              loading={categoryLoading}
              placeholder="Category"
              style={{ width: 190 }}
              options={categoryOptions}
              optionFilterProp="label"
              onChange={(value) =>
                handleFilterChange(
                  "categoryId",
                  value
                )
              }
            />

            <Select
              allowClear
              placeholder="Type"
              style={{ width: 150 }}
              options={[
                {
                  label: "Daily",
                  value: "alwaysAvailable",
                },
                {
                  label: "Menu Item",
                  value: "menuItem",
                },
              ]}
              onChange={(value) =>
                handleFilterChange(
                  "kind",
                  value
                )
              }
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
              onChange={(value) =>
                handleFilterChange(
                  "isActive",
                  value
                )
              }
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
  onPageChange={(page, pageSize) =>
    fetchFoods({
      page,
      pageSize,
    })
  }
/>
      </Card>

      <FoodDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        food={selectedFood}
        onClose={() =>
          setDetailOpen(false)
        }
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

