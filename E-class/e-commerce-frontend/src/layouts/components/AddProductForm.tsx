import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Upload,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';

const { TextArea } = Input;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
}

interface SelectOption {
  label: string;
  value: number;
}

const AddProductForm = ({ onFinish, onCancel }: { onFinish: (values: any) => void; onCancel: () => void }) => {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [origins, setOrigins] = useState<SelectOption[]>([]);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [brandsRes, categoriesRes, originsRes, suppliersRes] = await Promise.all([
          productService.getBrands(),
          productService.getCategories(),
          productService.getOrigins(),
          productService.getSuppliers(),
        ]);

        const formatOptions = (raw: any) => {
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
            label: item.name,
            value: item.id
          }));
        };

        setBrands(formatOptions(brandsRes.data));
        setCategories(formatOptions(categoriesRes.data));
        setOrigins(formatOptions(originsRes.data));
        setSuppliers(formatOptions(suppliersRes.data));

      } catch (error) {
        console.error("Failed to fetch select options:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleFinish = (values: any) => {
    onFinish(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ isActive: true, variants: [] }}>
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
            label="Mã dòng sản phẩm (Code)"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input placeholder="VD: AF1-WHITE" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="brand_id" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
            <Select placeholder="Chọn thương hiệu" options={brands} loading={loading} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
            <Select placeholder="Chọn danh mục" options={categories} loading={loading} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="origin_id" label="Xuất xứ" rules={[{ required: true, message: 'Vui lòng chọn xuất xứ' }]}>
            <Select placeholder="Chọn xuất xứ" options={origins} loading={loading} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="supplier_id" label="Nhà cung cấp" rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}>
            <Select placeholder="Chọn nhà cung cấp" options={suppliers} loading={loading} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Mô tả sản phẩm">
        <TextArea rows={4} placeholder="Mô tả chi tiết, câu chuyện sản phẩm..." />
      </Form.Item>
      <Form.Item name="images" label="Ảnh chung sản phẩm" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
        <Upload.Dragger name="files" listType="picture-card" beforeUpload={() => false}>
          <p className="ant-upload-drag-icon"><PlusOutlined /></p>
          <p className="ant-upload-text">Kéo & thả hoặc nhấn để chọn ảnh</p>
        </Upload.Dragger>
      </Form.Item>
      <Form.Item name="is_active" label="Trạng thái hoạt động" valuePropName="checked">
        <Switch defaultChecked />
      </Form.Item>

      <Row justify="end">
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