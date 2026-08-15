import React, { useEffect, useMemo, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Image,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  Row,
  Col,
} from "antd";
import imageNotFound from "../../assets/image-not-found.png";
import { getImageUrl } from "../../utils/image";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const toId = (value) => {
  if (!value) return undefined;

  if (typeof value === "object") {
    const id = value._id || value.id || value.ingredientId;
    return id && typeof id === "object"
      ? toId(id)
      : id
        ? String(id)
        : undefined;
  }

  return String(value);
};

const getIngredientId = (item = {}) => {
  const ingredient = item.ingredientId || item.ingredient || item.ingredient_id;
  return toId(ingredient);
};

const getIngredientUnit = (item = {}) => {
  const ingredient = item.ingredientId || item.ingredient;
  if (item.unit) return item.unit;
  if (typeof ingredient === "object") return ingredient.unit || "";
  return "";
};

const getQuantityPerServing = (item = {}) =>
  item.quantityPerServing ?? item.quantity ?? item.qty ?? item.amount ?? null;

const getRecipeItems = (values) => {
  if (!values) return [];
  if (Array.isArray(values.ingredients)) return values.ingredients;
  if (Array.isArray(values.foodIngredients)) return values.foodIngredients;
  if (Array.isArray(values.recipeIngredients)) return values.recipeIngredients;
  return [];
};

const normalizeInitialValues = (values) => ({
  categoryId: toId(values?.categoryId),
  name: values?.name || "",
  description: values?.description || "",
  imageFile: [],
  price: Number(values?.price || 0),
  stockQuantity:
    values?.stockQuantity === null || values?.stockQuantity === undefined
      ? null
      : Number(values.stockQuantity),
  isMenuItem: values?.isMenuItem === true,
  isActive: values?.isActive !== false,
  ingredients: getRecipeItems(values)
    .map((item) => ({
      ingredientId: getIngredientId(item),
      quantityPerServing:
        getQuantityPerServing(item) === null
          ? undefined
          : Number(getQuantityPerServing(item)),
      unit: getIngredientUnit(item),
    }))
    .filter(
      (item) => item.ingredientId || item.quantityPerServing || item.unit,
    ),
});

export default function FoodFormModal({
  open,
  mode = "create",
  initialValues,
  categories = [],
  ingredients = [],
  categoryLoading = false,
  ingredientLoading = false,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const [recipeRows, setRecipeRows] = useState([]);
  const isMenuItem = Form.useWatch("isMenuItem", form);

  const normalizedInitialValues = useMemo(
    () => normalizeInitialValues(initialValues),
    [initialValues],
  );
  const formKey =
    mode === "create"
      ? "create"
      : initialValues?._id || initialValues?.id || "update";

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setRecipeRows([]);
      return;
    }

    form.resetFields();
    form.setFieldsValue(normalizedInitialValues);
    setRecipeRows(
      normalizedInitialValues.ingredients.map((item, index) => ({
        ...item,
        rowKey: `${item.ingredientId || "ingredient"}-${index}`,
      })),
    );
  }, [form, formKey, normalizedInitialValues, open]);

  const categoryOptions = categories
    .map((category) => ({
      label: category.name || "Unnamed Category",
      value: toId(category),
    }))
    .filter((option) => option.value);

  const ingredientOptions = [
    ...ingredients,
    ...(getRecipeItems(initialValues).length
      ? getRecipeItems(initialValues)
          .map((item) => item.ingredientId || item.ingredient)
          .filter((item) => item && typeof item === "object")
      : []),
  ]
    .map((ingredient) => ({
      label: ingredient.unit
        ? `${ingredient.name || "Unnamed Ingredient"} (${ingredient.unit})`
        : ingredient.name || "Unnamed Ingredient",
      value: toId(ingredient),
      unit: ingredient.unit || "",
    }))
    .filter((option) => option.value)
    .filter(
      (option, index, options) =>
        options.findIndex((item) => item.value === option.value) === index,
    );

  const handleIngredientChange = (fieldName, ingredientId) => {
    const selected = ingredientOptions.find(
      (item) => item.value === ingredientId,
    );
    setRecipeRows((rows) =>
      rows.map((row, index) =>
        index === fieldName
          ? {
              ...row,
              ingredientId,
              unit: selected?.unit || row.unit || "",
            }
          : row,
      ),
    );
  };

  const handleRecipeFieldChange = (fieldName, key, value) => {
    setRecipeRows((rows) =>
      rows.map((row, index) =>
        index === fieldName ? { ...row, [key]: value } : row,
      ),
    );
  };

  const addRecipeRow = () => {
    setRecipeRows((rows) => [
      ...rows,
      {
        rowKey: `new-${Date.now()}-${rows.length}`,
        ingredientId: undefined,
        quantityPerServing: 1,
        unit: "",
      },
    ]);
  };

  const removeRecipeRow = (fieldName) => {
    setRecipeRows((rows) => rows.filter((_, index) => index !== fieldName));
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const nextIsMenuItem = Boolean(values.isMenuItem);
    const imageFile = values.imageFile?.[0]?.originFileObj;
    const recipeItems = recipeRows
      .filter((item) => item?.ingredientId)
      .map((item) => ({
        ingredientId: item.ingredientId,
        quantityPerServing: Number(item.quantityPerServing || 0),
        unit: normalizeText(item.unit),
      }));

    await onSubmit({
      ...values,
      name: normalizeText(values.name),
      description: normalizeText(values.description),
      categoryId: values.categoryId || null,
      price: Number(values.price || 0),
      stockQuantity: nextIsMenuItem ? null : Number(values.stockQuantity || 0),
      isMenuItem: nextIsMenuItem,
      isActive: Boolean(values.isActive),
      ingredients: recipeItems,
      imageFile,
    });
  };

  const normalizeUploadFileList = (event) => {
    if (Array.isArray(event)) return event;
    return event?.fileList || [];
  };

  const currentImageUrl = getImageUrl(initialValues?.imageUrl);

  return (
    <Modal
      title={mode === "create" ? "Create Food" : "Update Food"}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Update"}
      destroyOnHidden
      forceRender
      width={850}
      centered
    >
      <Form
        key={formKey}
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={normalizedInitialValues}
        className="pt-2"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Food Name"
              rules={[
    {
      required: true,
      message: "Food name is required",
    },
    {
      min: 2,
      message: "Food name must be at least 2 characters",
    },
    {
      max: 100,
      message: "Food name must be 100 characters or less",
    },
  ]}
            >
              <Input placeholder="Example: Grilled chicken rice" maxLength={100} />
            </Form.Item>

            <Form.Item name="categoryId" label="Category">
              <Select
                allowClear
                showSearch
                loading={categoryLoading}
                options={categoryOptions}
                placeholder="Select category"
                optionFilterProp="label"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price (VND)"
                  rules={[
    {
      required: true,
      message: "Food price is required",
    },
    {
      type: "number",
      min: 1000,
      message: "Food price must be at least 1,000 VND",
    },
  ]}
                >
                  <InputNumber className="w-full" min={0} precision={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                {!isMenuItem && (
                  <Form.Item
                    name="stockQuantity"
                    label="Daily Stock Quantity"
                    rules={[
                      { required: true, message: "Daily stock quantity is required" },
                    ]}
                  >
                    <InputNumber className="w-full" min={0} precision={0} />
                  </Form.Item>
                )}
              </Col>
            </Row>

            <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 md:mb-0">
              <Form.Item
                name="isMenuItem"
                label="Menu Schedule Item"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Active Status"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="imageFile"
                label="Food Image"
                valuePropName="fileList"
                getValueFromEvent={normalizeUploadFileList}
                className="mb-3"
              >
                <Upload
                  accept="image/*"
                  beforeUpload={() => false}
                  listType="picture"
                  maxCount={1}
                >
                  <Button icon={<PlusOutlined />} className="w-full">Select Image</Button>
                </Upload>
              </Form.Item>

              {currentImageUrl && (
                <div className="mb-3 flex flex-col justify-end">
                  <Typography.Text className="mb-2 block text-xs text-slate-500">
                    Current image
                  </Typography.Text>
                  <Image
                    src={currentImageUrl}
                    fallback={imageNotFound}
                    alt={initialValues?.name || "Food"}
                    width={112}
                    height={112}
                    className="rounded-md object-cover border border-slate-200"
                    preview={Boolean(initialValues?.imageUrl)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>

            <Form.Item name="description" label="Description" className="mb-0">
              <Input.TextArea rows={4} maxLength={500} showCount placeholder="Add description..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider className="my-6" />

        <div className="flex items-center justify-between mb-4">
          <Typography.Title level={5} className="!mb-0 !font-bold text-slate-800">
            Recipe Ingredients
          </Typography.Title>
          <span className="text-xs text-slate-400">
            Configure raw ingredients required per serving
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
          {recipeRows.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No ingredients added yet. Click "Add Ingredient" below.
            </div>
          ) : (
            recipeRows.map((row, index) => (
              <div
                key={row.rowKey || `${row.ingredientId || "ingredient"}-${index}`}
                className="grid grid-cols-12 gap-3 mb-3 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md"
              >
                <div className="col-span-12 md:col-span-6">
                  <Select
                    showSearch
                    loading={ingredientLoading}
                    options={ingredientOptions}
                    optionFilterProp="label"
                    placeholder="Select Ingredient"
                    value={row.ingredientId}
                    onChange={(value) => handleIngredientChange(index, value)}
                    className="w-full text-base"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <InputNumber
                    min={0.01}
                    precision={2}
                    placeholder="Quantity"
                    value={row.quantityPerServing}
                    onChange={(value) =>
                      handleRecipeFieldChange(index, "quantityPerServing", value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="col-span-4 md:col-span-2">
                  <Input
                    placeholder="Unit"
                    value={row.unit}
                    disabled
                    className="w-full bg-slate-50"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 text-right md:text-center">
                  <Button
                    danger
                    type="text"
                    shape="circle"
                    icon={<MinusCircleOutlined className="text-lg" />}
                    onClick={() => removeRecipeRow(index)}
                    className="hover:bg-red-50 flex items-center justify-center m-auto"
                  />
                </div>
              </div>
            ))
          )}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRecipeRow}
            block
            className="h-10 mt-2 border-dashed border-slate-300 text-slate-600 hover:text-blue-500 hover:border-blue-500 rounded-xl"
          >
            Add Ingredient
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
