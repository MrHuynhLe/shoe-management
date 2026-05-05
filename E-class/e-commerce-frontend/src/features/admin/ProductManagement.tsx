import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  notification,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Key, useEffect, useState } from "react";
import AddProductForm from "@/layouts/components/AddProductForm";
import { API_BASE_URL } from "@/services/axiosClient";
import {
  productService,
  ProductUpdatePayload,
  ProductVariantUpdatePayload,
} from "@/services/product.service";
import EditProductModal from "./EditProductModal";
import EditVariantModal from "./EditVariantModal";
import VariantDetailModal, { Variant } from "./VariantDetailModal";

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

type ProductForTable = ProductListWithVariants & {
  brand: string;
};

const { Title } = Typography;
const { Search } = Input;

const ProductManagementPage = () => {
  const [products, setProducts] = useState<ProductListWithVariants[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isVariantDetailModalOpen, setIsVariantDetailModalOpen] = useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editVariantLoading, setEditVariantLoading] = useState(false);
  const [variantDetailRefreshKey, setVariantDetailRefreshKey] = useState(0);

  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editProductLoading, setEditProductLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const fetchProducts = () => {
    setLoading(true);

    productService
      .getProducts({
        page: 0,
        size: 10,
        includeInactive: true,
      })
      .then((res) => {
        const formattedData: ProductForTable[] = res.data.content.map(
          (p: ProductList) => ({
            ...p,
            key: p.id,
            brand: p.brandName,
            hasVariants: p.totalStock > 0,
            hasPendingOrder: false,
            variants: [],
          }),
        );

        setProducts(formattedData);
      })
      .catch(() => {
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể tải danh sách sản phẩm.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProductSuccess = () => {
    setIsModalOpen(false);
    fetchProducts();

    notification.success({
      message: "Thành công",
      description: "Thêm sản phẩm thành công.",
    });
  };

  const handleAddProductFinish = async (values: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      const productDTO = {
        name: values.name,
        code: values.code || null,
        description: values.description ?? "",
        brandId: values.brand_id ? Number(values.brand_id) : null,
        categoryId: values.category_id ? Number(values.category_id) : null,
        originId: values.origin_id ? Number(values.origin_id) : null,
        supplierId: values.supplier_id ? Number(values.supplier_id) : null,
        isActive: values.is_active ?? true,
      };

      if (
        !productDTO.name ||
        !productDTO.brandId ||
        !productDTO.categoryId ||
        !productDTO.originId ||
        !productDTO.supplierId
      ) {
        notification.warning({
          message: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ các trường bắt buộc.",
        });
        return;
      }

      formData.append(
        "data",
        new Blob([JSON.stringify(productDTO)], {
          type: "application/json",
        }),
      );

      const imageFileList = values.images || [];
      const firstFile = imageFileList[0];

      if (firstFile?.originFileObj) {
        formData.append("image", firstFile.originFileObj);
      }

      imageFileList.slice(1).forEach((file: any) => {
        if (file?.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      const productRes = await productService.createProductWithImages(formData);
      const createdProductId = productRes?.data?.id || productRes?.data?.data?.id;

      if (!createdProductId) {
        throw new Error("Không lấy được productId sau khi tạo sản phẩm");
      }

      if (values.variants?.length) {
        await productService.bulkCreateVariantsOnly({
          productId: createdProductId,
          variants: values.variants.map((item: any) => ({
            costPrice: item.cost_price,
            sellingPrice: item.selling_price,
            stockQuantity: item.stock_quantity,
            isActive: item.is_active,
            attributeValueIds: [
              item.color_id,
              item.size_id,
              item.material_id,
            ].filter(Boolean),
          })),
        });
      }

      handleAddProductSuccess();
    } catch (error: any) {
      notification.error({
        message: "Lỗi thêm sản phẩm",
        description:
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Không thể thêm sản phẩm.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewVariants = (record: ProductForTable) => {
    setSelectedProductId(record.id);
    setIsVariantDetailModalOpen(true);
  };

  const handleOpenEditProduct = (record: ProductForTable) => {
    setEditingProductId(record.id);
    setIsEditProductModalOpen(true);
  };

  const handleUpdateProduct = async (
    productId: number,
    values: ProductUpdatePayload,
  ) => {
    setEditProductLoading(true);

    try {
      await productService.updateProduct(productId, values);

      notification.success({
        message: "Thành công",
        description: "Cập nhật sản phẩm thành công.",
      });

      setIsEditProductModalOpen(false);
      setEditingProductId(null);
      fetchProducts();
    } catch (error: any) {
      notification.error({
        message: "Lỗi cập nhật sản phẩm",
        description:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Không thể cập nhật sản phẩm.",
      });
    } finally {
      setEditProductLoading(false);
    }
  };

  const handleOpenEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setIsEditVariantModalOpen(true);
  };

  const handleUpdateVariant = async (
    variantId: number,
    values: ProductVariantUpdatePayload,
  ) => {
    setEditVariantLoading(true);

    try {
      await productService.updateVariant(variantId, values);

      notification.success({
        message: "Thành công",
        description: "Cập nhật biến thể thành công.",
      });

      setIsEditVariantModalOpen(false);
      setEditingVariant(null);
      fetchProducts();
      setVariantDetailRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      notification.error({
        message: "Lỗi cập nhật biến thể",
        description:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Không thể cập nhật biến thể.",
      });
    } finally {
      setEditVariantLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productService.deleteProduct(productId);

      notification.success({
        message: "Thành công",
        description: "Xóa sản phẩm thành công.",
      });

      fetchProducts();
    } catch (error: any) {
      notification.error({
        message: "Lỗi xóa sản phẩm",
        description:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Không thể xóa sản phẩm.",
      });
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await productService.deleteVariant(variantId);

      notification.success({
        message: "Thành công",
        description: "Xóa biến thể thành công.",
      });

      fetchProducts();
      setVariantDetailRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      notification.error({
        message: "Lỗi xóa biến thể",
        description:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Không thể xóa biến thể.",
      });
    }
  };

  const handleAddVariant = async (data: { productId: number; variants: any[] }) => {
    await productService.bulkCreateVariantsOnly(data);

    notification.success({
      message: "Thành công",
      description: "Thêm biến thể thành công.",
    });

    fetchProducts();
    setVariantDetailRefreshKey((prev) => prev + 1);
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 90,
      render: (imageUrl: string) =>
        imageUrl ? (
          <Image
            width={60}
            height={60}
            src={getImageUrl(imageUrl)}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            No image
          </div>
        ),
    },
    {
      title: "Mã SP",
      dataIndex: "code",
      key: "code",
      width: 130,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ProductForTable) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          <Typography.Text type="secondary">{record.brandName}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Giá nhập",
      key: "costPrice",
      width: 160,
      render: (_: any, record: ProductForTable) => {
        if (record.minCostPrice == null && record.maxCostPrice == null) {
          return "-";
        }

        if (record.minCostPrice === record.maxCostPrice) {
          return `${Number(record.minCostPrice).toLocaleString("vi-VN")} ₫`;
        }

        return `${Number(record.minCostPrice).toLocaleString("vi-VN")} - ${Number(
          record.maxCostPrice,
        ).toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Giá bán",
      key: "sellingPrice",
      width: 160,
      render: (_: any, record: ProductForTable) => {
        if (record.minPrice == null && record.maxPrice == null) {
          return "-";
        }

        if (record.minPrice === record.maxPrice) {
          return `${Number(record.minPrice).toLocaleString("vi-VN")} ₫`;
        }

        return `${Number(record.minPrice).toLocaleString("vi-VN")} - ${Number(
          record.maxPrice,
        ).toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      width: 100,
      render: (value: number) => (
        <Tag color={value > 0 ? "green" : "red"}>{value || 0}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_: any, record: ProductForTable) => (
        <Tag color={record.totalStock > 0 ? "green" : "orange"}>
          {record.totalStock > 0 ? "Có hàng" : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: any, record: ProductForTable) => (
        <Space>
          <Tooltip title="Xem biến thể">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewVariants(record)}
            />
          </Tooltip>

          <Tooltip title="Sửa sản phẩm">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenEditProduct(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc muốn xóa sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý sản phẩm
          </Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Thêm sản phẩm
          </Button>
        </Space>

        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton="Tìm kiếm"
          onSearch={() => fetchProducts()}
          style={{ maxWidth: 420 }}
        />

        <Table
          columns={columns}
          dataSource={products as any}
          loading={loading}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 10,
          }}
        />
      </Space>

      <Modal
        title="Thêm sản phẩm"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1200}
        destroyOnHidden
      >
        <AddProductForm
          onCancel={() => setIsModalOpen(false)}
          onFinish={handleAddProductFinish}
        />
      </Modal>

      <VariantDetailModal
        open={isVariantDetailModalOpen}
        productId={selectedProductId}
        onCancel={() => {
          setIsVariantDetailModalOpen(false);
          setSelectedProductId(null);
        }}
        onEdit={handleOpenEditVariant}
        onDelete={handleDeleteVariant}
        onAddVariant={handleAddVariant}
        refreshKey={variantDetailRefreshKey}
      />

      <EditProductModal
        open={isEditProductModalOpen}
        productId={editingProductId}
        confirmLoading={editProductLoading}
        onCancel={() => {
          setIsEditProductModalOpen(false);
          setEditingProductId(null);
        }}
        onSave={handleUpdateProduct}
      />

      <EditVariantModal
        open={isEditVariantModalOpen}
        variant={editingVariant}
        confirmLoading={editVariantLoading}
        onCancel={() => {
          setIsEditVariantModalOpen(false);
          setEditingVariant(null);
        }}
        onSave={handleUpdateVariant}
      />
    </Card>
  );
};

export default ProductManagementPage;
