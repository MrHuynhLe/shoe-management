import { Button, Input, Space, Table, Tag, Typography, Tooltip, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { ProductList } from '../product/product.model';

const { Title } = Typography;
const { Search } = Input;

const ProductManagementPage = () => {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService
      .getProducts(0, 10) 
      .then((res) => {

        const formattedData = res.data.content.map((p: ProductList, index: number) => ({
          ...p,
          key: p.id,
          code: `SP-${String(p.id).padStart(4, '0')}`,
          brand: ['Nike', 'Adidas', 'Jordan'][index % 3], 
          status: index % 2 === 0 ? 'Đang bán' : 'Ngừng bán', 
        }));
        setProducts(formattedData);
      })
      .catch((error) => console.error('Lỗi khi tải danh sách sản phẩm:', error))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hãng',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Đang bán' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center' as const,
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết"><Button icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search placeholder="Tìm kiếm theo tên hoặc mã sản phẩm" style={{ width: 400 }} />
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm mới sản phẩm
        </Button>
      </div>
      <Table columns={columns} dataSource={products} bordered loading={loading} rowKey="key" />
    </Space>
  );
};
export default ProductManagementPage;