import React, { useEffect } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
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

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeInitialValues = (values) => ({
  categoryId:
    typeof values?.categoryId === "object"
      ? values.categoryId?._id
      : values?.categoryId,
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
    ? values.ingredients.map((item) => ({
        ingredientId:
          typeof item?.ingredientId === "object"
            ? item.ingredientId?._id
            : item?.ingredientId,
        quantityPerServing: Number(item?.quantityPerServing || 0),
        unit: item?.unit || item?.ingredientId?.unit || "",
      }))
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

  const fillForm = () => {
    form.resetFields();
    form.setFieldsValue(normalizeInitialValues(initialValues));
  };

  useEffect(() => {
    if (!open) return;
    fillForm();
  }, [initialValues, open]);

  const categoryOptions = categories
    .map((category) => ({
      label: category.name || "Unnamed Category",
      value: category._id || category.id,
    }))
    .filter((option) => option.value);

  const ingredientOptions = ingredients
    .map((ingredient) => ({
      label: ingredient.unit
        ? `${ingredient.name || "Unnamed Ingredient"} (${ingredient.unit})`
        : ingredient.name || "Unnamed Ingredient",
      value: ingredient._id || ingredient.id,
      unit: ingredient.unit || "",
    }))
    .filter((option) => option.value);

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
      destroyOnClose
      forceRender
      afterOpenChange={(visible) => {
        if (visible) fillForm();
        else form.resetFields();
      }}
    >
      <Form form={form} layout="vertical" preserve={false}>
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
          label="Price"
          rules={[{ required: true, message: "Food price is required" }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            precision={0}
            addonAfter="VND"
          />
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
            <img
              src={currentImageUrl}
              alt={initialValues?.name || "Food"}
              className="h-28 w-28 rounded-md object-cover"
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
              {fields.map((field) => (
                <Space
                  key={field.key}
                  align="baseline"
                  className="mb-2 flex w-full"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "ingredientId"]}
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
                        handleIngredientChange(field.name, value)
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, "quantityPerServing"]}
                    rules={[
                      {
                        required: true,
                        message: "Quantity is required",
                      },
                    ]}
                  >
                    <InputNumber min={0.01} precision={2} placeholder="Qty" />
                  </Form.Item>

                  <Form.Item {...field} name={[field.name, "unit"]}>
                    <Input placeholder="Unit" className="w-20" />
                  </Form.Item>

                  <Button
                    danger
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
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
