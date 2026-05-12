import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Empty,
  Layout,
  Menu,
  Pagination,
  Row,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { ClearOutlined } from "@ant-design/icons";
import ProductListDisplay from "./Products";
import { productService } from "@/services/product.service";
import { PageResponse, ProductList as ProductItem } from "./product.model";

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

const ProductPage = () => {
  const [products, setProducts] = useState<PageResponse<ProductItem>>();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    categoryId?: number | null;
    brandId?: number | null;
  }>({
    categoryId: null,
    brandId: null,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12 });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.current - 1,
          size: pagination.pageSize,
          categoryId: filters.categoryId,
          brandId: filters.brandId,
        };
        const res = await productService.getProducts(params);
        setProducts(res.data);
      } catch (error) {
        message.error("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, pagination]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(categoryRes.data || []);
        setBrands(brandRes.data || []);
      } catch (error) {
        message.error("Không thể tải bộ lọc sản phẩm.");
      }
    };

    fetchOptions();
  }, []);

  const handleCategoryChange = (categoryId: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, categoryId }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleBrandChange = (brandId: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, brandId }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ categoryId: null, brandId: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const hasActiveFilter = Boolean(filters.categoryId || filters.brandId);

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <div className="app-section" style={{ padding: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Sản phẩm
        </Title>
        <Text type="secondary">
          Lọc theo danh mục hoặc thương hiệu để tìm mẫu giày phù hợp.
        </Text>
      </div>

      <Layout style={{ background: "transparent" }}>
        <Row gutter={[20, 20]} style={{ width: "100%", margin: 0 }}>
          <Col xs={24} lg={6} xl={5}>
            <Sider
              width="100%"
              className="app-section"
              style={{
                background: "#fff",
                height: "auto",
                padding: 20,
              }}
            >
              <Space
                align="center"
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Bộ lọc
                </Title>
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilter}
                >
                  Xóa
                </Button>
              </Space>

              <Divider />

              <Title level={5}>Danh mục</Title>
              <Menu
                onClick={(e) =>
                  handleCategoryChange(e.key === "all" ? null : Number(e.key))
                }
                selectedKeys={filters.categoryId ? [String(filters.categoryId)] : ["all"]}
                mode="inline"
                style={{ border: "none", background: "transparent" }}
                items={[
                  { key: "all", label: "Tất cả" },
                  ...categories.map((cat) => ({ key: cat.id, label: cat.name })),
                ]}
              />

              <Divider />

              <Title level={5}>Thương hiệu</Title>
              <Menu
                onClick={(e) =>
                  handleBrandChange(e.key === "all" ? null : Number(e.key))
                }
                selectedKeys={filters.brandId ? [String(filters.brandId)] : ["all"]}
                mode="inline"
                style={{ border: "none", background: "transparent" }}
                items={[
                  { key: "all", label: "Tất cả" },
                  ...brands.map((brand) => ({ key: brand.id, label: brand.name })),
                ]}
              />
            </Sider>
          </Col>

          <Col xs={24} lg={18} xl={19}>
            <Content className="app-section" style={{ padding: 24 }}>
              <Spin spinning={loading}>
                {products && products.content.length > 0 ? (
                  <Space direction="vertical" size={20} style={{ width: "100%" }}>
                    <ProductListDisplay products={products.content} hideTitle />
                    <Pagination
                      align="center"
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={products.totalElements}
                      showSizeChanger
                      onChange={(page, pageSize) =>
                        setPagination({ current: page, pageSize })
                      }
                    />
                  </Space>
                ) : (
                  !loading && (
                    <Empty description="Không tìm thấy sản phẩm nào phù hợp." />
                  )
                )}
              </Spin>
            </Content>
          </Col>
        </Row>
      </Layout>
    </Space>
  );
};

export default ProductPage;
