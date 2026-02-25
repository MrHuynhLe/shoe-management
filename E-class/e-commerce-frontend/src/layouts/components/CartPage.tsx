import { useState } from 'react';
import {
  Table,
  Button,
  InputNumber,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Image,
  Tooltip,
  Divider,
} from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';

const { Title, Text } = Typography;

const initialData = [
  {
    key: '1',
    image: 'https://via.placeholder.com/80',
    name: "Nike Air Force 1 '07",
    price: 2790000,
    quantity: 1,
  },
  {
    key: '2',
    image: 'https://via.placeholder.com/80',
    name: 'Adidas Ultraboost 22',
    price: 4500000,
    quantity: 1,
  },
  {
    key: '3',
    image: 'https://via.placeholder.com/80',
    name: 'Puma Suede Classic',
    price: 1800000,
    quantity: 2,
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(
    initialData.map((item) => ({ ...item, total: item.price * item.quantity }))
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleQuantityChange = (key: React.Key, value: number | null) => {
    if (value === null || value < 1) return;
    const newCartItems = cartItems.map((item) => {
      if (item.key === key) {
        return { ...item, quantity: value, total: item.price * value };
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  const handleRemoveItem = (key: React.Key) => {
    const newCartItems = cartItems.filter((item) => item.key !== key);
    setCartItems(newCartItems);
    setSelectedRowKeys(selectedRowKeys.filter(k => k !== key));
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <Image width={80} src={record.image} preview={false} />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.key, value)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Text strong style={{ color: '#c81d1d' }}>
          {total.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title="Xóa khỏi giỏ">
            <Button
              icon={<DeleteOutlined />}
              shape="circle"
              danger
              onClick={() => handleRemoveItem(record.key)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedItems = cartItems.filter((item) => selectedRowKeys.includes(item.key));
  const subtotal = selectedItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Giỏ hàng của bạn
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={cartItems}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            hoverable
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Title level={4}>Tóm tắt đơn hàng</Title>
            <Divider />
            <Row justify="space-between">
              <Text>Tạm tính ({selectedItems.length} sản phẩm)</Text>
              <Text strong>{subtotal.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            <Divider />
            <Row justify="space-between">
              <Text strong>Tổng cộng</Text>
              <Text strong style={{ color: '#c81d1d', fontSize: '1.2rem' }}>
                {subtotal.toLocaleString('vi-VN')} ₫
              </Text>
            </Row>
            <Button
              type="primary"
              danger
              block
              size="large"
              style={{ marginTop: '24px' }}
              disabled={selectedItems.length === 0}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;