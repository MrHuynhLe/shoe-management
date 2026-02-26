import { Radio, Slider, Space, Typography, Divider, Spin, Button, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { FilterOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';

const { Title } = Typography;

export interface ProductFilters {
  keyword?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

const ProductFilterSidebar = ({ filters, onFilterChange }: Props) => {
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          productService.getBrands(),
          productService.getCategories(),
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bộ lọc:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPriceRange([filters.minPrice ?? 0, filters.maxPrice ?? 10000000]);
  }, [filters.minPrice, filters.maxPrice]);

  const handleBrandChange = (e: any) => {
    onFilterChange({ ...filters, brandId: e.target.value || undefined });
  };

  const handleCategoryChange = (e: any) => {
    onFilterChange({ ...filters, categoryId: e.target.value || undefined });
  };

  const handlePriceAfterChange = (value: number[]) => {
    const min = value[0] === 0 ? undefined : value[0];
    const max = value[1] === 10000000 ? undefined : value[1];
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleReset = () => {
    setPriceRange([0, 10000000]);
    onFilterChange({ keyword: filters.keyword });
  };

  const sectionTitleStyle = {
    borderLeft: '3px solid #0052D9',
    paddingLeft: 12,
    fontSize: 15,
    fontWeight: 600,
  };

  return (
    <div
      style={{
        padding: '24px',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        position: 'sticky',
        top: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <FilterOutlined style={{ color: '#0052D9' }} /> Bộ lọc
        </Title>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleReset}
          style={{ color: '#999' }}
        >
          Xoá lọc
        </Button>
      </div>
      <Divider style={{ margin: '12px 0' }} />

      {loading ? (
        <Spin size="small" style={{ display: 'block', margin: '20px auto' }} />
      ) : (
        <>
          {/* Brand filter */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={sectionTitleStyle}>Thương hiệu</Title>
            <Radio.Group
              onChange={handleBrandChange}
              value={filters.brandId ?? null}
              style={{ marginTop: 8 }}
            >
              <Space direction="vertical">
                <Radio value={null}>Tất cả</Radio>
                {brands.map((b) => (
                  <Radio key={b.id} value={b.id}>{b.name}</Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
          <Divider style={{ margin: '12px 0' }} />

          {/* Category filter */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={sectionTitleStyle}>Danh mục</Title>
            <Radio.Group
              onChange={handleCategoryChange}
              value={filters.categoryId ?? null}
              style={{ marginTop: 8 }}
            >
              <Space direction="vertical">
                <Radio value={null}>Tất cả</Radio>
                {categories.map((c) => (
                  <Radio key={c.id} value={c.id}>{c.name}</Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
          <Divider style={{ margin: '12px 0' }} />

          {/* Price filter */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={sectionTitleStyle}>Khoảng giá</Title>
            <Slider
              range
              value={priceRange}
              onChange={(v) => setPriceRange(v as [number, number])}
              onChangeComplete={handlePriceAfterChange}
              max={10000000}
              step={100000}
              tooltip={{ formatter: (v) => `${(v || 0).toLocaleString('vi-VN')} ₫` }}
              style={{ marginTop: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <InputNumber
                size="small"
                value={priceRange[0]}
                min={0}
                max={priceRange[1]}
                step={100000}
                formatter={(v) => `${(v || 0).toLocaleString('vi-VN')}`}
                parser={(v) => Number((v || '').replace(/\./g, '').replace(/,/g, '')) as any}
                onChange={(v) => setPriceRange([v ?? 0, priceRange[1]])}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#999' }}>-</span>
              <InputNumber
                size="small"
                value={priceRange[1]}
                min={priceRange[0]}
                max={10000000}
                step={100000}
                formatter={(v) => `${(v || 0).toLocaleString('vi-VN')}`}
                parser={(v) => Number((v || '').replace(/\./g, '').replace(/,/g, '')) as any}
                onChange={(v) => setPriceRange([priceRange[0], v ?? 10000000])}
                style={{ flex: 1 }}
              />
            </div>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handlePriceAfterChange(priceRange)}
              style={{ width: '100%', marginTop: 8, borderRadius: 6 }}
            >
              Lọc giá
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductFilterSidebar;
