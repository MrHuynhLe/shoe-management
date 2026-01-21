import { Modal, Table, Space, Button, Tag } from 'antd';
import { useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface Variant { 
  id: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  selling_price: number;
  is_active: boolean;
}

interface VariantDetailModalProps {
  open: boolean;
  variants: Variant[];
  onCancel: () => void;
  onEdit: (record: Variant) => void;
  onDelete: (id: string) => void;
}

const VariantDetailModal: React.FC<VariantDetailModalProps> = ({ open, variants, onCancel, onEdit, onDelete }) => {
  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Màu', dataIndex: 'color', key: 'color' },
    { title: 'Giá bán', dataIndex: 'selling_price', key: 'selling_price' },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: any, record: Variant) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Chi tiết sản phẩm - Các biến thể"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnHidden
    >
      <Table
        columns={columns}
        dataSource={variants}
        rowKey="id"
        bordered
      />
    </Modal>
  );
};

export default VariantDetailModal;