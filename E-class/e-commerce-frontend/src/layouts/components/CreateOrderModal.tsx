import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Table, Space, Row, Col } from 'antd';


interface ProductList {
  id: number;
  name: string;
  code: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  selling_price: number;
  is_active: boolean;
}

interface ProductListWithVariants extends ProductList {
  totalStock?: number;
  hasVariants?: boolean;
  hasPendingOrder?: boolean;
  variants?: ProductVariant[];
}

const { TextArea } = Input;

interface CreateOrderModalProps {
  open: boolean;
  product: ProductListWithVariants | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CreateOrderModal = ({ open, product, onCancel, onSubmit }: CreateOrderModalProps) => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;                
    if (!product || !product.variants) {
      setVariants([]);
      form.resetFields();
      return;
    }

    const initialVariants = product.variants.map((variant, index) => ({
      ...variant,
      key: variant.id || index,
      order_quantity: 0,
    }));

    setVariants(initialVariants);
    form.setFieldsValue({ variants: initialVariants });
  }, [product, open, form]);


  const handleApplyToAll = (value: number | null) => {
    if (value === null || value < 0) return;
    const updatedVariants = variants.map(v => ({ ...v, order_quantity: value }));
    setVariants(updatedVariants);
    form.setFieldsValue({ variants: updatedVariants });
  };

  const handleFormSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        productId: product?.id,
        ...values
      });
      form.resetFields();
    }).catch(info => {
      console.error('Form validation failed:', info);
    });
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Màu', dataIndex: 'color', key: 'color' },
    { title: 'Tồn hiện tại', dataIndex: 'stock_quantity', key: 'stock_quantity', align: 'center' as const },
    {
      title: 'Nhập số lượng',
      dataIndex: 'order_quantity',
      key: 'order_quantity',
      width: 150,
      render: (_: any, record: any, index: number) => (
        <Form.Item
          name={['variants', index, 'order_quantity']}
          style={{ margin: 0 }}
          rules={[{ type: 'number', min: 0, message: 'Số lượng không hợp lệ' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title={`Tạo phiếu kho cho sản phẩm: ${product?.name || ''}`}
      open={open}
      onCancel={onCancel}
      width={800}
      destroyOnHidden
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleFormSubmit}>
          Gửi kho
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16} align="bottom">
          <Col span={18}>
            <Form.Item name="notes" label="Ghi chú phiếu">
              <TextArea rows={1} placeholder="Thêm ghi chú cho phiếu nhập kho" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Áp dụng cho tất cả">
              <InputNumber min={0} placeholder="Số lượng" style={{ width: '100%' }} onChange={handleApplyToAll} />
            </Form.Item>
          </Col>
        </Row>
        <Table bordered dataSource={variants} columns={columns} pagination={false} rowKey="key" />
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;