import { Button, Input, Space, Table, Tag, Typography, Tooltip, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import AddProductForm from '@/layouts/components/AddProductForm';
import CreateOrderModal from '@/layouts/components/CreateOrderModal';
import VariantDetailModal, { Variant } from './VariantDetailModal';
 
import EditVariantModal from './EditVariantModal';

interface ProductList {
  id: number;
  name: string;
  code: string;

}


interface ProductListWithVariants extends ProductList {
  key: React.Key;
  brand: string;
  totalStock: number;
  hasVariants: boolean;
  hasPendingOrder: boolean;
  variants: Variant[]; 
}
 
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

  const [selectedProduct, setSelectedProduct] = useState<ProductListWithVariants | null>(null); // Sửa kiểu dữ liệu
 
  useEffect(() => {
    setLoading(true);
    productService
      .getProducts(0, 10) 
      .then((res) => {
        // Dữ liệu giả lập cho variants, stock, và các trạng thái khác
        const formattedData = res.data.content.map((p: ProductList, index: number) => ({
          ...p,
          key: p.id,
          code: `SP-${String(p.id).padStart(4, '0')}`,
          brand: ['Nike', 'Adidas', 'Jordan'][index % 3],
          // --- SIMULATED DATA ---
          totalStock: index % 4 === 0 ? 0 : 10 + index, 
          hasVariants: true, 
          hasPendingOrder: index === 1, 
          variants: [
            { id: `v1-${p.id}`, sku: `SKU-${p.id}-1`, size: '40', color: 'Trắng', stock_quantity: index % 4 === 0 ? 0 : 5, selling_price: 1000000 + index * 10000, is_active: true }, // Thêm selling_price, is_active
            { id: `v2-${p.id}`, sku: `SKU-${p.id}-2`, size: '41', color: 'Đen', stock_quantity: index % 4 === 0 ? 0 : 5 + index, selling_price: 1100000 + index * 10000, is_active: false }, // Thêm selling_price, is_active
          ]
        }));
        setProducts(formattedData);
      })
      .catch((error) => console.error('Lỗi khi tải danh sách sản phẩm:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddProduct = (values: any) => {
    console.log('Submitting new product:', values);
    // TODO: Gọi API để thêm sản phẩm
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsModalOpen(true);
  };

  const showOrderModal = (product: ProductListWithVariants) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const showVariantDetailModal = (product: ProductListWithVariants) => { 
    setSelectedProduct(product);
    setIsVariantDetailModalOpen(true);
  };
  
  const handleEditVariant = (variant: Variant) => { 
    setEditingVariant(variant);
    setIsEditVariantModalOpen(true);
  };

  const handleDeleteVariant = (variantId: string) => {
    console.log('Deleting variant:', variantId);
    // TODO: Gọi API xóa biến thể
    // Sau khi xóa thành công, có thể cập nhật lại danh sách biến thể trong selectedProduct
    if (selectedProduct) {
      const updatedVariants = selectedProduct.variants.filter(v => v.id !== variantId);
      setSelectedProduct({ ...selectedProduct, variants: updatedVariants });
    }
  };

  const handleCancelVariantDetailModal = () => {
    setIsVariantDetailModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCreateOrder = (values: any) => {
    console.log('Submitting new purchase order:', values);
    // TODO: Gọi API để tạo phiếu kho
    setIsOrderModalOpen(false);
  };

  const handleSaveVariant = (values: Variant) => { 
    console.log('Saving variant changes:', values);
    // TODO: Gọi API để cập nhật biến thể
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
        // Giả định: nếu tồn kho = 0, tạm hiển thị là "Hết hàng"
        // Logic "Chưa nhập kho" cần thêm trường dữ liệu từ API
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
        variants={selectedProduct?.variants || []} 
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