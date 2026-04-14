import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Upload,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { productService } from "@/services/product.service";

const { TextArea } = Input;

interface SelectOption {
  label: string;
  value: number;
}

interface VariantItem {
  color_id: number;
  color_name: string;
  size_id: number;
  size_name: string;
  material_id: number;
  material_name: string;
  cost_price: number | null;
  selling_price: number | null;
  stock_quantity: number;
  is_active: boolean;
}

interface AddProductFormProps {
  onFinish: (values: any) => void;
  onCancel: () => void;
}

const AddProductForm = ({ onFinish, onCancel }: AddProductFormProps) => {
  const [form] = Form.useForm();

  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [origins, setOrigins] = useState<SelectOption[]>([]);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [colors, setColors] = useState<SelectOption[]>([]);
  const [sizes, setSizes] = useState<SelectOption[]>([]);
  const [materials, setMaterials] = useState<SelectOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantItem[]>([]);

  const selectedColorIds = Form.useWatch("selected_color_ids", form) || [];
  const selectedSizeIds = Form.useWatch("selected_size_ids", form) || [];
  const selectedMaterialIds =
    Form.useWatch("selected_material_ids", form) || [];

  const productName = Form.useWatch("name", form) || "";
  const codeSuffixRef = useRef(
    Math.random().toString(36).slice(2, 6).toUpperCase(),
  );

  const normalizeCodePart = (value: string) => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const buildProductCode = (name: string) => {
    const normalized = normalizeCodePart(name || "SAN-PHAM");
    const base = normalized.slice(0, 18) || "SAN-PHAM";
    return `${base}-${codeSuffixRef.current}`;
  };

  useEffect(() => {
    if (!productName?.trim()) {
      form.setFieldValue("code", "");
      return;
    }

    form.setFieldValue("code", buildProductCode(productName));
  }, [productName, form]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const formatOptions = (raw: any): SelectOption[] => {
          let list: any[] = [];

          if (Array.isArray(raw)) {
            list = raw;
          } else if (raw?.content && Array.isArray(raw.content)) {
            list = raw.content;
          } else if (raw?.data && Array.isArray(raw.data)) {
            list = raw.data;
          } else {
            console.error("Invalid options payload:", raw);
            return [];
          }

          return list.map((item: any) => ({
            label: item.value || item.name,
            value: item.id,
          }));
        };

        const [
          brandsRes,
          categoriesRes,
          originsRes,
          suppliersRes,
          colorsRes,
          sizesRes,
          materialsRes,
        ] = await Promise.all([
          productService.getBrands(),
          productService.getCategories(),
          productService.getOrigins(),
          productService.getSuppliers(),
          productService.getColors(),
          productService.getSizes(),
          productService.getMaterials(),
        ]);

        setBrands(formatOptions(brandsRes.data));
        setCategories(formatOptions(categoriesRes.data));
        setOrigins(formatOptions(originsRes.data));
        setSuppliers(formatOptions(suppliersRes.data));
        setColors(formatOptions(colorsRes.data));
        setSizes(formatOptions(sizesRes.data));
        setMaterials(formatOptions(materialsRes.data));
      } catch (error) {
        console.error("Failed to fetch select options:", error);
        message.error("Không tải được dữ liệu danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const colorMap = useMemo(() => {
    return new Map(colors.map((item) => [item.value, item.label]));
  }, [colors]);

  const sizeMap = useMemo(() => {
    return new Map(sizes.map((item) => [item.value, item.label]));
  }, [sizes]);

  const materialMap = useMemo(() => {
    return new Map(materials.map((item) => [item.value, item.label]));
  }, [materials]);

  const handleGenerateVariants = () => {
    if (
      !selectedColorIds.length ||
      !selectedSizeIds.length ||
      !selectedMaterialIds.length
    ) {
      message.warning("Vui lòng chọn ít nhất 1 màu, 1 size và 1 chất liệu");
      return;
    }

    const oldVariants: VariantItem[] = form.getFieldValue("variants") || [];
    const oldVariantMap = new Map(
      oldVariants.map((item) => [
        `${item.color_id}-${item.size_id}-${item.material_id}`,
        item,
      ]),
    );

    const generated: VariantItem[] = [];

    selectedColorIds.forEach((colorId: number) => {
      selectedSizeIds.forEach((sizeId: number) => {
        selectedMaterialIds.forEach((materialId: number) => {
          const key = `${colorId}-${sizeId}-${materialId}`;
          const oldItem = oldVariantMap.get(key);

          const colorName = colorMap.get(colorId) || "";
          const sizeName = sizeMap.get(sizeId) || "";
          const materialName = materialMap.get(materialId) || "";

          generated.push({
            color_id: colorId,
            color_name: colorName,
            size_id: sizeId,
            size_name: sizeName,
            material_id: materialId,
            material_name: materialName,
            cost_price: oldItem?.cost_price ?? null,
            selling_price: oldItem?.selling_price ?? null,
            stock_quantity: oldItem?.stock_quantity ?? 0,
            is_active: oldItem?.is_active ?? true,
          });
        });
      });
    });

    setVariantRows(generated);
    form.setFieldsValue({ variants: generated });
    message.success("Đã tạo danh sách biến thể");
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantItem,
    value: any,
  ) => {
    const next = [...variantRows];
    next[index] = {
      ...next[index],
      [field]: value,
    };
    setVariantRows(next);
    form.setFieldsValue({ variants: next });
  };

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      variants: variantRows.map((item) => ({
        color_id: item.color_id,
        size_id: item.size_id,
        material_id: item.material_id,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        stock_quantity: item.stock_quantity,
        is_active: item.is_active,
      })),
    };

    if (!payload.variants?.length) {
      message.error("Vui lòng tạo ít nhất 1 biến thể");
      return;
    }

    const hasInvalidPrice = payload.variants.some(
      (item: any) =>
        item.cost_price == null ||
        item.selling_price == null ||
        item.cost_price < 0 ||
        item.selling_price < 0,
    );

    if (hasInvalidPrice) {
      message.error("Vui lòng nhập đầy đủ giá nhập và giá bán cho tất cả biến thể");
      return;
    }

    onFinish(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        is_active: true,
        selected_color_ids: [],
        selected_size_ids: [],
        selected_material_ids: [],
        variants: [],
      }}
    >
      <Divider orientation="left">Thông tin chung</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="VD: Nike Air Force 1 '07" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã sản phẩm"
            rules={[
              { required: true, message: "Mã sản phẩm đang được tự sinh" },
            ]}
          >
            <Input placeholder="Mã sản phẩm tự sinh" readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="brand_id"
            label="Thương hiệu"
            rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
          >
            <Select
              placeholder="Chọn thương hiệu"
              options={brands}
              loading={loading}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              options={categories}
              loading={loading}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="origin_id"
            label="Xuất xứ"
            rules={[{ required: true, message: "Vui lòng chọn xuất xứ" }]}
          >
            <Select
              placeholder="Chọn xuất xứ"
              options={origins}
              loading={loading}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="supplier_id"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select
              placeholder="Chọn nhà cung cấp"
              options={suppliers}
              loading={loading}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Mô tả sản phẩm">
        <TextArea
          rows={4}
          placeholder="Mô tả chi tiết, câu chuyện sản phẩm..."
        />
      </Form.Item>

      <Form.Item
        name="images"
        label="Ảnh sản phẩm"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload.Dragger
          name="files"
          listType="picture-card"
          beforeUpload={() => false}
          multiple
          maxCount={5}
        >
          <p className="ant-upload-drag-icon">
            <PlusOutlined />
          </p>
          <p className="ant-upload-text">Kéo & thả hoặc nhấn để chọn ảnh</p>
          <p style={{ fontSize: 12, color: "#999" }}>
            Ảnh đầu tiên sẽ là ảnh chính của sản phẩm
          </p>
        </Upload.Dragger>
      </Form.Item>

      <Form.Item
        name="is_active"
        label="Trạng thái hoạt động"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Divider orientation="left">Thiết lập biến thể</Divider>

      <Row gutter={16}>
        <Col span={7}>
          <Form.Item
            name="selected_color_ids"
            label="Chọn màu"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 màu" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các màu"
              options={colors}
              loading={loading}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>

        <Col span={7}>
          <Form.Item
            name="selected_size_ids"
            label="Chọn size"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 size" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các size"
              options={sizes}
              loading={loading}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="selected_material_ids"
            label="Chọn chất liệu"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 chất liệu" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các chất liệu"
              options={materials}
              loading={loading}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label=" ">
            <Button type="dashed" block onClick={handleGenerateVariants}>
              Tạo biến thể
            </Button>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="variants" hidden>
        <Input />
      </Form.Item>

      <Divider orientation="left">Danh sách biến thể</Divider>

      {variantRows.length === 0 ? (
        <Empty description="Chưa có biến thể. Hãy chọn màu, size và bấm Tạo biến thể" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {variantRows.map((variant, index) => (
            <Card
              key={`${variant.color_id}-${variant.size_id}-${variant.material_id}`}
              size="small"
              title={`Biến thể: ${variant.color_name} / ${variant.size_name} / ${variant.material_name}`}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Giá nhập" required>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={variant.cost_price}
                      onChange={(value) =>
                        handleVariantChange(index, "cost_price", value)
                      }
                      placeholder="Giá nhập"
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label="Giá bán" required>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={variant.selling_price}
                      onChange={(value) =>
                        handleVariantChange(index, "selling_price", value)
                      }
                      placeholder="Giá bán"
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label="Tồn kho" required>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={variant.stock_quantity}
                      onChange={(value) =>
                        handleVariantChange(index, "stock_quantity", value ?? 0)
                      }
                      placeholder="Số lượng"
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label="Hoạt động">
                    <Switch
                      checked={variant.is_active}
                      onChange={(checked) =>
                        handleVariantChange(index, "is_active", checked)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      )}

      <Row justify="end" style={{ marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu sản phẩm
          </Button>
        </Space>
      </Row>
    </Form>
  );
};

export default AddProductForm;