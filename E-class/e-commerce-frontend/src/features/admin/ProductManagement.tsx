import { Button, Input, Space, Table, Tag, Typography, Tooltip, Modal, notification } from 'antd';
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
  code: string; 
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
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null); 
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

  const handleAddProduct = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      const productDTO = {
        name: values.name,
        code: values.code,
        description: values.description ?? "",
        brandId: values.brand_id ? Number(values.brand_id) : null,
        categoryId: values.category_id ? Number(values.category_id) : null,
        originId: values.origin_id ? Number(values.origin_id) : null,
        supplierId: values.supplier_id ? Number(values.supplier_id) : null,
        isActive: values.is_active ?? true
      };

      console.log("FINAL DTO TO SEND:", productDTO);

      if (
        !productDTO.brandId ||
        !productDTO.categoryId ||
        !productDTO.originId ||
        !productDTO.supplierId ||
        !productDTO.name ||
        !productDTO.code
      ) {
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng điền đầy đủ các trường bắt buộc (*)',
        });
        setLoading(false);
        return;
      }
      formData.append(
        "data",
        new Blob([JSON.stringify(productDTO)], { type: "application/json" })
      );

      if (values.image?.originFileObj) {
        formData.append("image", values.image.originFileObj);
      } else if (values.image?.[0]?.originFileObj) {

        formData.append("image", values.image[0].originFileObj);
      }

      if (values.images && values.images.length > 0) {
        values.images.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }
      await productService.createProduct(formData);
      setIsModalOpen(false);
      notification.success({
        message: 'Thành công',
        description: 'Sản phẩm đã được tạo thành công!',
      });

    } catch (error: any) {
      const serverMessage = error.response?.data?.message
        || error.response?.data
        || 'Đã có lỗi xảy ra trong quá trình tạo sản phẩm.';

      notification.error({
        message: 'Tạo sản phẩm thất bại',
        description: typeof serverMessage === 'string' ? serverMessage : 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.',
      });
    } finally {
      setLoading(false);
    }
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

  const handleAddVariant = (values: any) => {
    console.log('Adding new variant to product:', values);
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
          <Tooltip title="Xem chi tiết sản phẩm"><Button icon={<EyeOutlined />} onClick={() => showVariantDetailModal(record)} /></Tooltip> {/* Chỉ giữ lại một nút */}

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
        onAddVariant={handleAddVariant}
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