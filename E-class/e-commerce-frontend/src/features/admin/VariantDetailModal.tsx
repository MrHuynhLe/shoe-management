import {
  Modal,
  Table,
  Space,
  Button,
  Tag,
  Spin,
  Descriptions,
  Typography,
  Divider,
  Form,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
} from 'antd';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';

export interface ProductVariantAttributes {
  COLOR: string;
  SIZE: string;
}

export interface Variant {
  id: number;
  code: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: ProductVariantAttributes;
}

export interface ProductDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  brandName: string;
  categoryName: string;
  originName: string;
  isActive: boolean;
  variants: Variant[];
}

interface VariantDetailModalProps {
  open: boolean;
  productId: number | null; 
  onCancel: () => void;
  onEdit: (record: Variant) => void;
  onDelete: (id: number) => void;
  onAddVariant: (values: any) => void;
}

const VariantDetailModal: React.FC<VariantDetailModalProps> = ({ open, productId, onCancel, onEdit, onDelete, onAddVariant }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [addVariantForm] = Form.useForm();

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      productService.getProductById(productId)
        .then(response => {
          setProduct(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch product details:", error);
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!open) {
      setProduct(null); 
      addVariantForm.resetFields();
    }
  }, [open, productId]);

  const columns = [
    { title: 'SKU', dataIndex: 'code', key: 'code' },
    { title: 'Size', dataIndex: ['attributes', 'SIZE'], key: 'size' },
    { title: 'Màu', dataIndex: ['attributes', 'COLOR'], key: 'color' },
    { title: 'Giá bán', dataIndex: 'sellingPrice', key: 'sellingPrice', render: (price: number) => price.toLocaleString('vi-VN') + ' ₫' },
    { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Variant) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id)}>
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddVariantFinish = (values: any) => {
    console.log('Adding variant:', values);
    onAddVariant({ ...values, productId });
    addVariantForm.resetFields();
  };

  return (
    <Modal
      title={`Chi tiết sản phẩm: ${product?.name || ''}`}
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        {product && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã sản phẩm">{product.code}</Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{product.brandName}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{product.categoryName}</Descriptions.Item>
              <Descriptions.Item label="Xuất xứ">{product.originName}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>{product.description}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Các phiên bản (SKU)</Typography.Title>
            <Table
              columns={columns}
              dataSource={product.variants}
              rowKey="id"
              bordered
              pagination={false}
            />

            <Divider>Thêm biến thể mới</Divider>
            <Form form={addVariantForm} layout="vertical" onFinish={handleAddVariantFinish}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="size" label="Size" rules={[{ required: true }]}>
                    <Select placeholder="Chọn size" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="color" label="Màu" rules={[{ required: true }]}>
                    <Select placeholder="Chọn màu" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="costPrice" label="Giá vốn" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="Giá nhập" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="sellingPrice" label="Giá bán" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="Giá bán" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="variantImages"
                    label="Ảnh riêng của biến thể"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  >
                    <Upload beforeUpload={() => false} listType="picture-card">
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  Thêm biến thể
                </Button>
              </Form.Item>
            </Form>
          </Space>
        )}
      </Spin>
    </Modal>
  );
};

export default VariantDetailModal;