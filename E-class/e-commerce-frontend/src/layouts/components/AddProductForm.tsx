import { useEffect, useMemo, useState } from 'react';
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
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';

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
  sku: string;
  price: number | null;
  sale_price: number | null;
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

  const [loading, setLoading] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantItem[]>([]);

  const selectedColorIds = Form.useWatch('selected_color_ids', form) || [];
  const selectedSizeIds = Form.useWatch('selected_size_ids', form) || [];
  const productCode = Form.useWatch('code', form) || '';

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [
          brandsRes,
          categoriesRes,
          originsRes,
          suppliersRes,
          colorsRes,
          sizesRes,
        ] = await Promise.all([
          productService.getBrands(),
          productService.getCategories(),
          productService.getOrigins(),
          productService.getSuppliers(),
          productService.getColors(), // nhớ kiểm tra service của bạn có hàm này chưa
          productService.getSizes(),  // nhớ kiểm tra service của bạn có hàm này chưa
        ]);

        const formatOptions = (raw: any): SelectOption[] => {
          let list: any[] = [];

          if (Array.isArray(raw)) {
            list = raw;
          } else if (raw?.content && Array.isArray(raw.content)) {
            list = raw.content;
          } else if (raw?.data && Array.isArray(raw.data)) {
            list = raw.data;
          } else {
            console.error('Invalid options payload:', raw);
            return [];
          }

          return list.map((item: any) => ({
            label: item.name ?? item.value,
            value: item.id,
          }));
        };

        setBrands(formatOptions(brandsRes.data));
        setCategories(formatOptions(categoriesRes.data));
        setOrigins(formatOptions(originsRes.data));
        setSuppliers(formatOptions(suppliersRes.data));
        setColors(formatOptions(colorsRes.data));
        setSizes(formatOptions(sizesRes.data));
      } catch (error) {
        console.error('Failed to fetch select options:', error);
        message.error('Không tải được dữ liệu danh mục');
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

  const buildSku = (baseCode: string, colorName: string, sizeName: string) => {
    const normalize = (value: string) =>
      value
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '');

    const code = normalize(baseCode || 'SP');
    const color = normalize(colorName || 'COLOR');
    const size = normalize(sizeName || 'SIZE');

    return `${code}-${color}-${size}`;
  };

  const handleGenerateVariants = () => {
    if (!selectedColorIds.length || !selectedSizeIds.length) {
      message.warning('Vui lòng chọn ít nhất 1 màu và 1 size');
      return;
    }

    const oldVariants: VariantItem[] = form.getFieldValue('variants') || [];
    const oldVariantMap = new Map(
      oldVariants.map((item) => [`${item.color_id}-${item.size_id}`, item])
    );

    const generated: VariantItem[] = [];

    selectedColorIds.forEach((colorId: number) => {
      selectedSizeIds.forEach((sizeId: number) => {
        const key = `${colorId}-${sizeId}`;
        const oldItem = oldVariantMap.get(key);

        const colorName = colorMap.get(colorId) || '';
        const sizeName = sizeMap.get(sizeId) || '';

        generated.push({
          color_id: colorId,
          color_name: colorName,
          size_id: sizeId,
          size_name: sizeName,
          sku: oldItem?.sku || buildSku(productCode, colorName, sizeName),
          price: oldItem?.price ?? null,
          sale_price: oldItem?.sale_price ?? null,
          stock_quantity: oldItem?.stock_quantity ?? 0,
          is_active: oldItem?.is_active ?? true,
        });
      });
    });

    setVariantRows(generated);
    form.setFieldsValue({ variants: generated });
    message.success('Đã tạo danh sách biến thể');
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantItem,
    value: any
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
        sku: item.sku,
        price: item.price,
        sale_price: item.sale_price,
        stock_quantity: item.stock_quantity,
        is_active: item.is_active,
      })),
    };

    if (!payload.variants?.length) {
      message.error('Vui lòng tạo ít nhất 1 biến thể');
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
        variants: [],
      }}
    >
      <Divider orientation="left">Thông tin chung</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Nike Air Force 1 '07" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã dòng sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
          >
            <Input placeholder="VD: AF1-WHITE" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="brand_id"
            label="Thương hiệu"
            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn xuất xứ' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
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
        label="Ảnh chung sản phẩm"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload.Dragger
          name="files"
          listType="picture-card"
          beforeUpload={() => false}
          multiple
        >
          <p className="ant-upload-drag-icon">
            <PlusOutlined />
          </p>
          <p className="ant-upload-text">Kéo & thả hoặc nhấn để chọn ảnh</p>
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
        <Col span={10}>
          <Form.Item
            name="selected_color_ids"
            label="Chọn màu"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 màu' }]}
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

        <Col span={10}>
          <Form.Item
            name="selected_size_ids"
            label="Chọn size"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 size' }]}
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
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {variantRows.map((variant, index) => (
            <Card
              key={`${variant.color_id}-${variant.size_id}`}
              size="small"
              title={`Biến thể: ${variant.color_name} / ${variant.size_name}`}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="SKU" required>
                    <Input
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, 'sku', e.target.value)
                      }
                      placeholder="SKU biến thể"
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item label="Giá bán" required>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      value={variant.price}
                      onChange={(value) =>
                        handleVariantChange(index, 'price', value)
                      }
                      placeholder="Giá bán"
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item label="Giá khuyến mãi">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      value={variant.sale_price}
                      onChange={(value) =>
                        handleVariantChange(index, 'sale_price', value)
                      }
                      placeholder="Giá khuyến mãi"
                    />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item label="Tồn kho" required>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      value={variant.stock_quantity}
                      onChange={(value) =>
                        handleVariantChange(index, 'stock_quantity', value ?? 0)
                      }
                      placeholder="Số lượng"
                    />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item label="Hoạt động">
                    <Switch
                      checked={variant.is_active}
                      onChange={(checked) =>
                        handleVariantChange(index, 'is_active', checked)
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