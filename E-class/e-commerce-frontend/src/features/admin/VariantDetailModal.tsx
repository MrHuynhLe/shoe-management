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
  [key: string]: string;
}

export interface Variant {
  id: number;
  code: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: ProductVariantAttributes;
  images?: string[];
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
  images: string[];
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
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);
  const [selectedBulkAttributes, setSelectedBulkAttributes] = useState<Record<string, string[]>>({});
  const [bulkCostPrice, setBulkCostPrice] = useState<number | null>(null);
  const [bulkSellingPrice, setBulkSellingPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {

        const response = await productService.getAttributes();
        setDynamicAttributes(response.data || []);
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
      setSelectedBulkAttributes({});
    }
  }, [open, productId, addVariantForm]);

  // Helper to get all existing and currently-in-form combinations
  const getExistingAndFormCombinations = (excludeIndex?: number) => {
    const combinations = new Set<string>(); // Using a Set to store unique combinations

    // Helper to create a sorted, stable key from attribute values
    const createCombinationKey = (attributes: Record<string, string>) => {
      return Object.keys(attributes).sort().map(key => `${key}:${attributes[key]}`).join('|');
    };

    // 1. Add combinations from variants already saved in the backend
    if (product?.variants) {
      product.variants.forEach(v => {
        combinations.add(createCombinationKey(v.attributes));
      });
    }

    // 2. Add combinations from other variants currently in the form
    const currentFormVariants = addVariantForm.getFieldsValue().variants || [];
    currentFormVariants.forEach((v: any, index: number) => {
      // Check if the variant has attributes and is not the one to be excluded
      if ((excludeIndex === undefined || index !== excludeIndex) && v && v.attributes) {
        const hasAllAttributes = dynamicAttributes.every(attr => v.attributes[attr.code]);
        if (hasAllAttributes) {
          combinations.add(createCombinationKey(v.attributes));
        }
      }
    });

    return combinations;
  };

  const columns = [
    { title: 'SKU', dataIndex: 'code', key: 'code' },
    ...dynamicAttributes.map(attr => ({
      title: attr.name,
      dataIndex: ['attributes', attr.code],
      key: attr.code,
    })),
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

      // Map form data to the DTO structure expected by the backend
      const variantsToSubmit = values.variants.map((variant: any) => {
        const attributeValueIds: number[] = [];
        // Find the ID for each selected attribute value
        for (const attr of dynamicAttributes) {
          const selectedValue = variant.attributes[attr.code];
          const attrValue = attr.values.find((v: any) => v.value === selectedValue);
          if (attrValue) {
            attributeValueIds.push(attrValue.id);
          }
        }

        return {
          code: variant.sku || generateSku(variant.attributes),
          costPrice: variant.costPrice,
          sellingPrice: variant.sellingPrice,
          stockQuantity: variant.stockQuantity || 0,
          imageUrl: variant.imageUrl || null, // Assuming imageUrl is handled by upload
          attributeValueIds: attributeValueIds,
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

  const generateSku = (attributes: Record<string, string> = {}) => {
    const productCode = product?.code || 'PRODUCT';
    // Create a SKU part from each attribute, sorted by attribute code for consistency
    const attributeParts = dynamicAttributes
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(attr => {
        const value = attributes[attr.code] || attr.code;
        return value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d").replace(/Đ/g, "D")
          .toUpperCase()
          .replace(/\s/g, '');
      })
      .join('-');

    return `${productCode}-${attributeParts}`;
  };

  const handleGenerateVariants = () => {
    const selectedValues = Object.values(selectedBulkAttributes).filter(v => v.length > 0);
    if (selectedValues.length < dynamicAttributes.length) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: `Vui lòng chọn ít nhất một giá trị cho mỗi thuộc tính để tạo hàng loạt.`,
      });
      return;
    }

    const existingFormVariants = addVariantForm.getFieldValue('variants') || [];
    const allExistingCombinations = getExistingAndFormCombinations();
    const createCombinationKey = (attributes: Record<string, string>) => {
      return Object.keys(attributes).sort().map(key => `${key}:${attributes[key]}`).join('|');
    };

    const newVariantsToAdd: any[] = [];
    let duplicateCount = 0;

    // A recursive function to generate all combinations
    const generateCombinations = (attrIndex: number, currentCombination: any) => {
      if (attrIndex === dynamicAttributes.length) {
        const combinationKey = createCombinationKey(currentCombination);
        if (!allExistingCombinations.has(combinationKey)) {
          newVariantsToAdd.push({ attributes: currentCombination, sku: generateSku(currentCombination) });
        }
        else {
          duplicateCount++;
        }
        return;
      }

      const currentAttr = dynamicAttributes[attrIndex];
      const selectedValuesForAttr = selectedBulkAttributes[currentAttr.code] || [];
      selectedValuesForAttr.forEach(value => {
        generateCombinations(attrIndex + 1, { ...currentCombination, [currentAttr.code]: value });
      });
    };

    generateCombinations(0, {});

    if (duplicateCount > 0) {
      notification.warning({
        message: 'Bỏ qua biến thể trùng lặp',
        description: `Đã bỏ qua ${duplicateCount} biến thể trùng lặp (Size/Màu đã tồn tại hoặc đã có trong form).`,
      });
    }

    addVariantForm.setFieldsValue({ variants: [...existingFormVariants, ...newVariantsToAdd] });
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
    setSelectedBulkAttributes({});
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
              <Row gutter={[16, 16]}>
                {dynamicAttributes.map(attr => (
                  <Col span={24 / (dynamicAttributes.length + 1)} key={attr.code}>
                    <Select
                      mode="multiple" allowClear style={{ width: '100%' }}
                      placeholder={`Chọn ${attr.name}`}
                      onChange={(values) => setSelectedBulkAttributes(prev => ({ ...prev, [attr.code]: values }))}
                      options={attr.values.map((v: any) => ({ label: v.value, value: v.value }))} />
                  </Col>
                ))}
                <Col span={24 / (dynamicAttributes.length + 1)}>
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
                  if (changedIndex !== -1 && allValues.variants[changedIndex]?.attributes) {
                    const target = allValues.variants[changedIndex];
                    const newSku = generateSku(target.attributes);
                    const currentVariants = [...allValues.variants];
                    currentVariants[changedIndex] = { ...target, sku: newSku };
                    addVariantForm.setFieldsValue({ variants: currentVariants });
                  }
                }
              }}
            >

              <Row gutter={8} style={{ marginBottom: 8, padding: '0 8px' }}>
                <Col span={4}><Typography.Text strong>SKU (Review)</Typography.Text></Col>
                {dynamicAttributes.map(attr => (
                  <Col span={3} key={attr.code}><Typography.Text strong>{attr.name}</Typography.Text></Col>
                ))}
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
                        {dynamicAttributes.map(attr => (
                          <Col span={3} key={attr.code}>
                            <Form.Item {...restField} name={[name, 'attributes', attr.code]} rules={[{ required: true, message: 'Chọn' }]} noStyle>
                              <Select
                                placeholder={attr.name}
                                style={{ width: '100%' }}
                                options={attr.values.map((v: any) => ({ label: v.value, value: v.value }))}
                              />
                            </Form.Item>
                          </Col>
                        ))}
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'costPrice']} rules={[{ required: true, message: 'Nhập' }]} noStyle>
                            <InputNumber placeholder="Giá vốn" style={{ width: '100%' }}
                              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''}
                              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item {...restField} name={[name, 'sellingPrice']} rules={[{ required: true, message: 'Nhập' }]} noStyle>
                            <InputNumber placeholder="Giá bán" style={{ width: '100%' }}
                              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''}
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