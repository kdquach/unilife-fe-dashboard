import React, { useEffect } from "react";
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
} from "antd";
import imageNotFound from "../../assets/image-not-found.png";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const toId = (value) => {
  if (!value) return undefined;

  if (typeof value === "object") {
    const id = value._id || value.id || value.ingredientId;
    return id && typeof id === "object" ? toId(id) : id ? String(id) : undefined;
  }

  return String(value);
};

const getIngredientId = (item = {}) => {
  const ingredient =
    item.ingredientId || item.ingredient || item.ingredient_id;
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
  ingredients: Array.isArray(values?.ingredients)
    ? values.ingredients
        .map((item) => ({
          ingredientId: getIngredientId(item),
          quantityPerServing:
            getQuantityPerServing(item) === null
              ? undefined
              : Number(getQuantityPerServing(item)),
          unit: getIngredientUnit(item),
        }))
        .filter((item) => item.ingredientId || item.quantityPerServing || item.unit)
    : [],
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
  getImageUrl,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const isMenuItem = Form.useWatch("isMenuItem", form);

  useEffect(() => {
    if (!open) return;

    const nextValues = normalizeInitialValues(initialValues);
    form.resetFields();
    form.setFieldsValue(nextValues);
    form.setFieldValue("ingredients", nextValues.ingredients);
  }, [form, initialValues, open]);

  const categoryOptions = categories
    .map((category) => ({
      label: category.name || "Unnamed Category",
      value: toId(category),
    }))
    .filter((option) => option.value);

  const ingredientOptions = [
    ...ingredients,
    ...(Array.isArray(initialValues?.ingredients)
      ? initialValues.ingredients
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
    const selected = ingredientOptions.find((item) => item.value === ingredientId);
    form.setFieldValue(["ingredients", fieldName, "unit"], selected?.unit || "");
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const nextIsMenuItem = Boolean(values.isMenuItem);
    const imageFile = values.imageFile?.[0]?.originFileObj;
    const recipeItems = (values.ingredients || [])
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

  const currentImageUrl =
    initialValues?.imageUrl && getImageUrl
      ? getImageUrl(initialValues.imageUrl)
      : null;

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
      afterOpenChange={(visible) => {
        if (!visible) form.resetFields();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="Food Name"
          rules={[
            { required: true, message: "Food name is required" },
            { max: 120, message: "Food name must be 120 characters or less" },
          ]}
        >
          <Input placeholder="Example: Grilled chicken rice" maxLength={120} />
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

        <Form.Item
          name="price"
          label="Price (VND)"
          rules={[{ required: true, message: "Food price is required" }]}
        >
          <InputNumber className="w-full" min={0} precision={0} />
        </Form.Item>

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

        <Form.Item
          name="imageFile"
          label="Food Image"
          valuePropName="fileList"
          getValueFromEvent={normalizeUploadFileList}
        >
          <Upload
            accept="image/*"
            beforeUpload={() => false}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<PlusOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>

        {currentImageUrl && (
          <div className="mb-4">
            <Typography.Text className="mb-2 block text-xs text-slate-500">
              Current image
            </Typography.Text>
            <Image
              src={currentImageUrl}
              fallback={imageNotFound}
              alt={initialValues?.name || "Food"}
              width={112}
              height={112}
              className="rounded-md object-cover"
              preview={Boolean(initialValues?.imageUrl)}
            />
          </div>
        )}

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} maxLength={500} showCount />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="isMenuItem" label="Menu Schedule Item" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        <Typography.Text strong>Recipe Ingredients</Typography.Text>
        <Form.List name="ingredients">
          {(fields, { add, remove }) => (
            <div className="mt-3">
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  className="mb-2 flex w-full"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "ingredientId"]}
                    rules={[
                      { required: true, message: "Ingredient is required" },
                    ]}
                    className="flex-1"
                  >
                    <Select
                      showSearch
                      loading={ingredientLoading}
                      options={ingredientOptions}
                      optionFilterProp="label"
                      placeholder="Ingredient"
                      onChange={(value) =>
                        handleIngredientChange(name, value)
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantityPerServing"]}
                    rules={[
                      {
                        required: true,
                        message: "Quantity is required",
                      },
                    ]}
                  >
                    <InputNumber min={0.01} precision={2} placeholder="Qty" />
                  </Form.Item>

                  <Form.Item {...restField} name={[name, "unit"]}>
                    <Input placeholder="Unit" className="w-20" />
                  </Form.Item>

                  <Button
                    danger
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ quantityPerServing: 1 })}
                block
              >
                Add Ingredient
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
