import {
  Modal,
  Table,
  Space,
  Button,
  Tag,
  Spin,
  Descriptions,
  Typography,
  Divider,
  Form,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  Upload,
  notification,
} from 'antd';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';
import { App} from 'antd';
export interface ProductVariantAttributes {
  COLOR: string;
  SIZE: string;
}

export interface Variant {
  id: number;
  code: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: ProductVariantAttributes;
}

export interface ProductDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  brandName: string;
  categoryName: string;
  originName: string;
  isActive: boolean;
  variants: Variant[];
}

interface VariantDetailModalProps {
  open: boolean;
  productId: number | null;
  onCancel: () => void;
  onEdit: (record: Variant) => void;
  onDelete: (id: number) => void;

  onAddVariant: (data: { productId: number; variants: any[] }) => Promise<void>;
}
interface AttributeOption {
  label: string;
  value: string;
  id: number;
}

const VariantDetailModal: React.FC<VariantDetailModalProps> = ({
  open, productId, onCancel, onEdit, onDelete, onAddVariant
}) => {
  const { notification, message } = App.useApp();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [addVariantForm] = Form.useForm();
  const [sizes, setSizes] = useState<AttributeOption[]>([]);
  const [colors, setColors] = useState<AttributeOption[]>([]);
  const [selectedBulkSizes, setSelectedBulkSizes] = useState<string[]>([]);
  const [selectedBulkColors, setSelectedBulkColors] = useState<string[]>([]);
  const [bulkCostPrice, setBulkCostPrice] = useState<number | null>(null);
  const [bulkSellingPrice, setBulkSellingPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {

        const response = await productService.getAttributes();
        const attributes = response.data;

        const sizeAttribute = attributes.find((attr: any) => attr.code === 'SIZE');
        const colorAttribute = attributes.find((attr: any) => attr.code === 'COLOR');

        const formatOptions = (values: any[]): AttributeOption[] =>
          values.map(item => ({ label: item.value, value: item.value, id: item.id })); 
        if (sizeAttribute && sizeAttribute.values) {
          setSizes(formatOptions(sizeAttribute.values));
        } else {
          setSizes([]);
        }
        if (colorAttribute && colorAttribute.values) {
          setColors(formatOptions(colorAttribute.values));
        } else {
          setColors([]);
        }
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải thuộc tính sản phẩm.',
        });
      }
    };

    if (open && productId) {
      setLoading(true);
      fetchAttributes();
      productService.getProductById(productId)
        .then(response => {
          setProduct(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch product details:", error);
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!open) {
      setProduct(null);
      addVariantForm.resetFields();
    }
  }, [open, productId, addVariantForm]);

  const columns = [
    { title: 'SKU', dataIndex: 'code', key: 'code' },
    { title: 'Size', dataIndex: ['attributes', 'SIZE'], key: 'size' },
    { title: 'Màu', dataIndex: ['attributes', 'COLOR'], key: 'color' },
    { title: 'Giá bán', dataIndex: 'sellingPrice', key: 'sellingPrice', render: (price: number) => price.toLocaleString('vi-VN') + ' ₫' },
    { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Variant) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id)}>
          </Button>
        </Space>
      ),
    },
  ];
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await productService.uploadImage(formData);
      return response.data;
    } catch (error) {
      notification.error({ message: 'Lỗi upload ảnh' });
      throw error;
    }
  };
  const handleAddVariantFinish = async (values: any) => {
    try {
      setLoading(true);

      const variantsToSubmit = values.variants.map((variant: any) => {
        const sizeAttr = sizes.find(s => s.value === variant.size);
        const colorAttr = colors.find(c => c.value === variant.color);
        const attrIds = [sizeAttr?.id, colorAttr?.id].filter(Boolean);

        return {

          code: generateSku(variant.size, variant.color),
          costPrice: variant.costPrice,
          sellingPrice: variant.sellingPrice,
          stockQuantity: variant.stockQuantity || 0,
          imageUrl: variant.imageUrl || null,
          attributeValueIds: attrIds,
        };
      });

      await productService.bulkCreateVariantsOnly({
        productId: productId as number,
        variants: variantsToSubmit
      });

      notification.success({ message: 'Thành công', description: 'Đã lưu các biến thể.' });
      handleResetForm();
      onCancel();
    } catch (error: any) {
      console.error("Lỗi khi tạo bulk:", error);
      notification.error({
        message: 'Lỗi',
        description: error.response?.data?.message || 'Không thể lưu biến thể (Lỗi 415 hoặc định dạng dữ liệu).'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSku = (size?: string, color?: string) => {
    const productCode = product?.code || 'PRODUCT';
    const sizeCode = (size || 'SIZE').toUpperCase().replace(/\s/g, '');

    const colorCode = (color || 'COLOR')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toUpperCase()
      .replace(/\s/g, '');

    return `${productCode}-${sizeCode}-${colorCode}`.toUpperCase();
  };

  const handleGenerateVariants = () => {
    if (selectedBulkSizes.length === 0 || selectedBulkColors.length === 0) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng chọn ít nhất một size và một màu để tạo hàng loạt.',
      });
      return;
    }

    const existingVariants = addVariantForm.getFieldValue('variants') || [];
    const newVariants: any[] = [];

    selectedBulkSizes.forEach(size => {
      selectedBulkColors.forEach(color => {
        const isDuplicate = existingVariants.some((v: any) => v && v.size === size && v.color === color);
        if (!isDuplicate) {
          newVariants.push({
            size,
            color,
            sku: generateSku(size, color),
            costPrice: null,
            sellingPrice: null,
            stockQuantity: 0,
            variantImages: []
          });
        }
      });
    });

    addVariantForm.setFieldsValue({ variants: [...existingVariants, ...newVariants] });
  };

  const handleApplyBulkPrices = () => {
    const currentVariants = addVariantForm.getFieldValue('variants') || [];
    if (currentVariants.length === 0) {
      notification.info({
        message: 'Chưa có biến thể',
        description: 'Vui lòng tạo biến thể trước khi áp dụng giá.',
      });
      return;
    }

    const updatedVariants = currentVariants.map((variant: any) => {
      if (!variant) return null;
      return {
        ...variant,
        costPrice: bulkCostPrice !== null ? bulkCostPrice : variant.costPrice,
        sellingPrice: bulkSellingPrice !== null ? bulkSellingPrice : variant.sellingPrice,
      };
    }).filter(Boolean);

    addVariantForm.setFieldsValue({ variants: updatedVariants });
    notification.success({
      message: 'Thành công',
      description: 'Đã áp dụng giá hàng loạt.',
    });
  };

  const handleResetForm = () => {
    addVariantForm.resetFields();
    setSelectedBulkSizes([]);
    setSelectedBulkColors([]);
    setBulkCostPrice(null);
    setBulkSellingPrice(null);
  };
  return (
    <Modal
      title={`Chi tiết sản phẩm: ${product?.name || ''}`}
      open={open}
      onCancel={onCancel}
      width={1200}
      footer={null}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        {product && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã sản phẩm">{product.code}</Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{product.brandName}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{product.categoryName}</Descriptions.Item>
              <Descriptions.Item label="Xuất xứ">{product.originName}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>{product.description}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Các phiên bản (SKU)</Typography.Title>
            <Table
              columns={columns}
              dataSource={product.variants}
              rowKey="id"
              bordered
              pagination={false}
            />

            <Divider>Thêm biến thể mới</Divider>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Typography.Text>Tạo hàng loạt theo thuộc tính</Typography.Text>
              <Row gutter={16}>
                <Col span={8}>
                  <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="Chọn các size" value={selectedBulkSizes} onChange={setSelectedBulkSizes} options={sizes} />
                </Col>
                <Col span={8}>
                  <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="Chọn các màu" value={selectedBulkColors} onChange={setSelectedBulkColors} options={colors} />
                </Col>
                <Col span={8}>
                  <Button onClick={handleGenerateVariants} block>Tạo hàng loạt</Button>
                </Col>
              </Row>
            </Space>

            <Divider>Áp dụng hàng loạt cho các dòng bên dưới</Divider>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá vốn hàng loạt"
                  style={{ width: '100%' }}
                  onChange={(value) => setBulkCostPrice(value === null ? null : Number(value))}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá bán hàng loạt"
                  style={{ width: '100%' }}
                  onChange={(value) => setBulkSellingPrice(value === null ? null : Number(value))}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Col>
              <Col span={8}>
                <Button onClick={handleApplyBulkPrices} block>Áp dụng giá</Button>
              </Col>
            </Row>

            <Form
              form={addVariantForm}
              onFinish={handleAddVariantFinish}
              autoComplete="off"
              onValuesChange={(changedValues, allValues) => {
                if (changedValues.variants) {
                  const changedIndex = changedValues.variants.findIndex((v: any) => v && (v.size || v.color));
                  if (changedIndex !== -1) {
                    const target = allValues.variants[changedIndex];
                    const newSku = generateSku(target.size, target.color);
                    const currentVariants = [...allValues.variants];
                    currentVariants[changedIndex] = { ...target, sku: newSku };
                    addVariantForm.setFieldsValue({ variants: currentVariants });
                  }
                }
              }}
            >

              <Row gutter={8} style={{ marginBottom: 8, padding: '0 8px' }}>
                <Col span={5}><Typography.Text strong>SKU (Review)</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Size</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Màu</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Giá vốn</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Giá bán</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Tồn kho</Typography.Text></Col>
                <Col span={4}><Typography.Text strong>Ảnh/Xóa</Typography.Text></Col>
              </Row>
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={4}>
                          <Form.Item {...restField} name={[name, 'sku']} noStyle >
                            <Input placeholder="SKU" disabled />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'size']} rules={[{ required: true, message: 'Chọn' }]} noStyle>
                            <Select options={sizes} placeholder="Size" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'color']} rules={[{ required: true, message: 'Chọn' }]} noStyle>
                            <Select options={colors} placeholder="Màu" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'costPrice']} rules={[{ required: true, message: 'Nhập' }]} noStyle>
                            <InputNumber placeholder="Giá vốn" style={{ width: '100%' }}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'sellingPrice']} rules={[{ required: true, message: 'Nhập' }]} noStyle>
                            <InputNumber placeholder="Giá bán" style={{ width: '100%' }}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'stockQuantity']} rules={[{ required: true, message: 'Nhập' }]} noStyle>
                            <InputNumber placeholder="Tồn kho" min={0} style={{ width: '100%' }} disabled />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Space align="start">
                            <Form.Item {...restField} name={[name, 'variantImages']} valuePropName="fileList"
                              getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList;
                              }} noStyle>
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                customRequest={async ({ file, onSuccess, onError }: any) => {
                                  try {
                                    const url = await handleUpload(file);
                                    const allVariants = addVariantForm.getFieldValue('variants');
                                    allVariants[name].imageUrl = url;
                                    addVariantForm.setFieldsValue({ variants: allVariants });
                                    onSuccess("ok");
                                  } catch (err) {
                                    console.error("Upload error:", err);
                                    onError(err);
                                  }
                                }}
                              >
                                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Ảnh</div></div>
                              </Upload>
                            </Form.Item>
                            <Button icon={<DeleteOutlined />} danger onClick={() => remove(name)} />
                          </Space>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add({ stockQuantity: 0 })} block icon={<PlusOutlined />}>
                        Thêm dòng biến thể thủ công
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Lưu các biến thể
                  </Button>
                  <Button onClick={handleResetForm}>Làm mới</Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        )}
      </Spin>
    </Modal>
  );
};

export default VariantDetailModal;