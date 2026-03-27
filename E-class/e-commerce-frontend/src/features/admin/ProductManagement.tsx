import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip,
  Modal,
  notification,
  Image,
  Popconfirm,
  Card,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  InboxOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState, Key } from "react";
import { productService } from "@/services/product.service";
import AddProductForm from "@/layouts/components/AddProductForm";
import CreateOrderModal from "@/layouts/components/CreateOrderModal";
import VariantDetailModal, { Variant } from "./VariantDetailModal";
import { API_BASE_URL } from "@/services/axiosClient";

import EditVariantModal from "./EditVariantModal";

interface ProductList {
  id: number;
  name: string;
  code: string;
  brandName: string;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  minCostPrice: number;
  maxCostPrice: number;
  imageUrl: string;
}

interface ProductListWithVariants extends ProductList {
  key: Key;
  hasVariants: boolean;
  hasPendingOrder: boolean;
  variants: Variant[];
}

type ProductForTable = Omit<ProductListWithVariants, "brand"> & {
  brand: string;
};

const { Title } = Typography;
const { Search } = Input;

const ProductManagementPage = () => {
  const [products, setProducts] = useState<ProductListWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isVariantDetailModalOpen, setIsVariantDetailModalOpen] =
    useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductForTable | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const fetchProducts = () => {
    setLoading(true);
    productService
      .getProducts({ page: 0, size: 10 })
      .then((res) => {
        const formattedData: ProductForTable[] = res.data.content.map(
          (p: ProductList) => ({
            ...p,
            key: p.id,
            brand: p.brandName,
            hasVariants: true,
            hasPendingOrder: false,
            variants: [],
          }),
        );
        setProducts(formattedData);
      })
      .catch((error) => console.error("Lỗi khi tải danh sách sản phẩm:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
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
      isActive: values.is_active ?? true,
    };

    if (
      !productDTO.brandId ||
      !productDTO.categoryId ||
      !productDTO.originId ||
      !productDTO.supplierId ||
      !productDTO.name ||
      !productDTO.code
    ) {
      notification.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ các trường bắt buộc (*)",
      });
      return;
    }

    formData.append(
      "data",
      new Blob([JSON.stringify(productDTO)], {
        type: "application/json",
      })
    );

    const imageFileList = values.images || [];

    if (imageFileList.length > 0) {
      // ảnh đầu tiên = ảnh chính
      const firstFile = imageFileList[0];
      if (firstFile?.originFileObj) {
        formData.append("image", firstFile.originFileObj);
      }

      // các ảnh còn lại = ảnh phụ
      imageFileList.slice(1).forEach((file: any) => {
        if (file?.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });
    }

    // QUAN TRỌNG: gọi đúng endpoint with-images
    const productRes = await productService.createProductWithImages(formData);

    const createdProductId =
      productRes?.data?.id || productRes?.data?.data?.id;

    if (!createdProductId) {
      throw new Error("Không lấy được productId sau khi tạo sản phẩm");
    }

    if (values.variants && values.variants.length > 0) {
      const variantsPayload = values.variants.map((item: any) => ({
        code: item.sku,
        costPrice: item.sale_price ?? item.price,
        sellingPrice: item.price,
        stockQuantity: item.stock_quantity,
        attributeValueIds: [item.color_id, item.size_id],
      }));

      await productService.bulkCreateVariantsOnly({
        productId: createdProductId,
        variants: variantsPayload,
      });
    }

    setIsModalOpen(false);
    notification.success({
      message: "Thành công",
      description: "Sản phẩm đã được tạo thành công!",
    });

    fetchProducts();
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    const serverMessage =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Đã có lỗi xảy ra trong quá trình tạo sản phẩm.";

    notification.error({
      message: "Tạo sản phẩm thất bại",
      description:
        typeof serverMessage === "string"
          ? serverMessage
          : "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
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

  const handleDeleteVariant = async (variantId: number) => {
    try {
      setLoading(true);
      await productService.deleteVariant(variantId);
      notification.success({
        message: "Thành công",
        description: "Biến thể đã được xóa thành công!",
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error("Lỗi khi xóa biến thể:", error);
      notification.error({ message: "Lỗi", description: error.response?.data?.message || "Không thể xóa biến thể." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVariantDetailModal = () => {
    setIsVariantDetailModalOpen(false);
    setSelectedProductId(null);
  };

  const handleCreateOrder = (values: any) => {
    console.log("Submitting new purchase order:", values);
    setIsOrderModalOpen(false);
  };

  const handleSaveVariant = (values: Variant) => {
    console.log("Saving variant changes:", values);
    setIsEditVariantModalOpen(false);
  };

  const handleAddVariant = async (data: {
    productId: number;
    variants: any[];
  }) => {
    const { productId, variants } = data;

    try {
      setLoading(true);

      await productService.bulkCreateVariants(productId, variants);
      notification.success({
        message: "Thành công",
        description: "Các biến thể đã được thêm thành công!",
      });
      handleCancelVariantDetailModal();
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to add variants:", error);
      const serverMessage =
        error.response?.data?.message || "Đã có lỗi xảy ra khi thêm biến thể.";
      notification.error({
        message: "Thêm biến thể thất bại",
        description:
          typeof serverMessage === "string"
            ? serverMessage
            : "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      align: "center" as const,
      render: (imageUrl: string) => {
        if (!imageUrl) return "Không có ảnh";

        const fullImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${API_BASE_URL}${imageUrl}`;

        return (
          <Image
            width={50}
            src={fullImageUrl}
            fallback="https://via.placeholder.com/50?text=No+Image"
          />
        );
      },
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hãng",
      dataIndex: "brand",
      key: "brand",
      align: "center" as const,
    },
    {
      title: "Giá bán",
      key: "price",
      align: "center" as const,
      render: (_: any, record: ProductList) => {
        const { minPrice, maxPrice } = record;
        if (minPrice === null || maxPrice === null) {
          return "Chưa có giá";
        }
        const min = Number(minPrice);
        const max = Number(maxPrice);

        if (min === max) {
          return `${min.toLocaleString("vi-VN")} ₫`;
        }

        return `${min.toLocaleString("vi-VN")} ₫ - ${max.toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Tổng tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "center" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "center" as const,
      render: (stock: number) => {
        if (stock > 0) {
          return <Tag color="green">ĐANG BÁN</Tag>;
        }
        return <Tag color="red">HẾT HÀNG</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết sản phẩm">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="text"
              size="large"
              onClick={() => showVariantDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa sản phẩm">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              type="text"
              size="large"
              onClick={() => notification.info({ message: 'Chức năng đang phát triển' })}
            />
          </Tooltip>
          {record.hasVariants && (
            <Tooltip title="Tạo phiếu kho">
              <Button
                icon={<InboxOutlined />}
                shape="circle"
                type="text"
                size="large"
                onClick={() => showOrderModal(record)}
                disabled={record.hasPendingOrder}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Hành động này sẽ xóa sản phẩm và tất cả biến thể liên quan. Bạn có chắc chắn?"
            onConfirm={async () => {
              try {
                setLoading(true);
                await productService.deleteProduct(record.id);
                notification.success({
                  message: "Thành công",
                  description: "Sản phẩm đã được xóa thành công!",
                });
                fetchProducts();
              } catch (error: any) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                notification.error({ message: "Lỗi", description: error.response?.data?.message || "Không thể xóa sản phẩm." });
              } finally {
                setLoading(false);
              }
            }}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} danger shape="circle" size="large" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 6px 16px rgb(0 0 0 / 8%)' }}
      bodyStyle={{ padding: 24 }}
      bordered={false}
      title={<Title level={3} style={{ margin: 0, color: '#0f172a' }}>Quản lý sản phẩm</Title>}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 10,
          }}
        >
          <Search
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm"
            style={{ maxWidth: 420, width: '100%' }}
            allowClear
            onSearch={(v) => console.log('Search', v)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            style={{ borderRadius: 8, minWidth: 170 }}
          >
            Thêm mới sản phẩm
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={products}
          pagination={{ pageSize: 8 }}
          loading={loading}
          rowKey="key"
          size="middle"
          bordered
          style={{ borderRadius: 10, background: '#ffffff' }}
        />

      <Modal
        title="Thêm mới sản phẩm"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <AddProductForm
          onFinish={handleAddProduct}
          onCancel={() => setIsModalOpen(false)}
        />
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
  </Card>
  );
};
export default ProductManagementPage;
