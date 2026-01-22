import { Button, Input, Space, Table, Tag, Typography, Tooltip, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { useEffect, useState, Key } from 'react';
import { productService } from '@/services/product.service';
import AddProductForm from '@/layouts/components/AddProductForm';
import CreateOrderModal from '@/layouts/components/CreateOrderModal';
import VariantDetailModal, { Variant } from './VariantDetailModal';
 
import EditVariantModal from './EditVariantModal';

interface ProductList {
  id: number;
  name: string;
  code: string; // Mã dòng sản phẩm
  brandName: string;
  totalStock: number;
}


interface ProductListWithVariants extends ProductList {
  key: Key;
  hasVariants: boolean;
  hasPendingOrder: boolean;
  variants: Variant[]; 
}
 
type ProductForTable = Omit<ProductListWithVariants, 'brand'> & { brand: string };

const { Title } = Typography;
const { Search } = Input;

const ProductManagementPage = () => {
  const [products, setProducts] = useState<ProductListWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isVariantDetailModalOpen, setIsVariantDetailModalOpen] = useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null); // Sử dụng Variant
  const [selectedProduct, setSelectedProduct] = useState<ProductForTable | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
 
  useEffect(() => {
    setLoading(true);
    productService
      .getProducts(0, 10) 
      .then((res) => {
        const formattedData: ProductForTable[] = res.data.content.map((p: ProductList) => ({
          ...p,
          key: p.id,
          brand: p.brandName, 
          hasVariants: true, 
          hasPendingOrder: false, 
          variants: [], 
        }));
        setProducts(formattedData);
      })
      .catch((error) => console.error('Lỗi khi tải danh sách sản phẩm:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddProduct = (values: any) => {
    console.log('Submitting new product:', values);
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsModalOpen(true);
  };

  const showOrderModal = (product: ProductForTable) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const showVariantDetailModal = (record: ProductForTable) => { 
    setSelectedProductId(record.id);
    setIsVariantDetailModalOpen(true);
  };
  
  const handleEditVariant = (variant: Variant) => { 
    setEditingVariant(variant);
    setIsEditVariantModalOpen(true);
  };

  const handleDeleteVariant = (variantId: number) => {
    console.log('Deleting variant:', variantId);
  };

  const handleCancelVariantDetailModal = () => {
    setIsVariantDetailModalOpen(false);
    setSelectedProductId(null);
  };

  const handleCreateOrder = (values: any) => {
    console.log('Submitting new purchase order:', values);
    setIsOrderModalOpen(false);
  };

  const handleSaveVariant = (values: Variant) => { 
    console.log('Saving variant changes:', values);
    setIsEditVariantModalOpen(false);
  };

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
      dataIndex: 'totalStock',
      key: 'totalStock',
      align: 'center' as const,
      render: (stock: number) => {
        if (stock > 0) {
          return <Tag color="green">ĐANG BÁN</Tag>;
        }
        return <Tag color="red">HẾT HÀNG</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center' as const,
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết sản phẩm"><Button icon={<EyeOutlined />} onClick={() => showVariantDetailModal(record)}/></Tooltip> {/* Chỉ giữ lại một nút */}

           {record.hasVariants && (
            <Tooltip title="Tạo phiếu kho">
              <Button 
                icon={<InboxOutlined />} 
                onClick={() => showOrderModal(record)}
                disabled={record.hasPendingOrder}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>          
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search placeholder="Tìm kiếm theo tên hoặc mã sản phẩm" style={{ width: 400 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm mới sản phẩm
        </Button>
      </div>
      <Table columns={columns} dataSource={products} bordered loading={loading} rowKey="key" />

      <Modal
        title="Thêm mới sản phẩm"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        <AddProductForm onFinish={handleAddProduct} onCancel={() => setIsModalOpen(false)} />
      </Modal>
       <VariantDetailModal
        open={isVariantDetailModalOpen}
        productId={selectedProductId}
        onCancel={handleCancelVariantDetailModal}
        onEdit={handleEditVariant}
        onDelete={handleDeleteVariant}
      />

      <EditVariantModal
        open={isEditVariantModalOpen}
        variant={editingVariant}
        onCancel={() => setIsEditVariantModalOpen(false)}
        onSave={handleSaveVariant}
      />

      <CreateOrderModal 
        open={isOrderModalOpen}
        product={selectedProduct}
        onCancel={() => setIsOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </Space>
  );
};
export default ProductManagementPage;