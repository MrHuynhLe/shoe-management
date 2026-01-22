import { Modal, Table, Space, Button, Tag, Spin, Descriptions, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
}

const VariantDetailModal: React.FC<VariantDetailModalProps> = ({ open, productId, onCancel, onEdit, onDelete }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

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
          </Space>
        )}
      </Spin>
    </Modal>
  );
};

export default VariantDetailModal;