import { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Upload,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const mockOptions = (items: string[]) =>
  items.map((item) => ({ label: item, value: item.toLowerCase().replace(' ', '') }));
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: any;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <InputNumber style={{ width: '100%' }} />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={['variants', index, dataIndex]}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Vui lòng nhập ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


const AddProductForm = ({ onFinish, onCancel }: { onFinish: (values: any) => void; onCancel: () => void }) => {
  const [form] = Form.useForm();
  const [creationMode, setCreationMode] = useState('single'); 

  const bulkColors = Form.useWatch('bulk_colors', form);
  const bulkSizes = Form.useWatch('bulk_sizes', form);
  const bulkCostPrice = Form.useWatch('bulk_cost_price', form);
  const bulkSellingPrice = Form.useWatch('bulk_selling_price', form);
  const productCode = Form.useWatch('code', form);

  useEffect(() => {
    if (creationMode !== 'bulk' || !bulkColors?.length || !bulkSizes?.length) {
      form.setFieldsValue({ variants: [] });
      return;
    }

    const newVariants = bulkColors.flatMap((color: string) =>
      bulkSizes.map((size: string) => {
        const colorLabel = mockOptions(['Trắng', 'Đen', 'Đỏ']).find(o => o.value === color)?.label || color;
        const sizeLabel = mockOptions(['40', '41', '42', '43']).find(o => o.value === size)?.label || size;

        return {
          key: `${color}-${size}`,
          sku: `${productCode || 'CODE'}-${sizeLabel}-${colorLabel.substring(0, 3).toUpperCase()}`,
          color: colorLabel,
          size: sizeLabel,
          cost_price: bulkCostPrice,
          selling_price: bulkSellingPrice,
        };
      })
    );

    form.setFieldsValue({ variants: newVariants });
  }, [creationMode, bulkColors, bulkSizes, bulkCostPrice, bulkSellingPrice, productCode, form]);

  const handleFinish = (values: any) => {
    if (creationMode === 'bulk') {
      console.log('Submitting bulk variants:', values);
    } else {
      console.log('Submitting single variants:', values);
    }
    onFinish(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ isActive: true, variants: [] }}>
      <Divider orientation="left">Thông tin chung</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Nike Air Force 1 '07" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã dòng sản phẩm (Code)"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input placeholder="VD: AF1-WHITE" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="brand_id" label="Thương hiệu" rules={[{ required: true }]}>
            <Select placeholder="Chọn thương hiệu" options={mockOptions(['Nike', 'Adidas', 'Jordan'])} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="category_id" label="Danh mục" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục" options={mockOptions(['Sneaker', 'Sandal', 'Boot'])} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="origin_id" label="Xuất xứ" rules={[{ required: true }]}>
            <Select placeholder="Chọn xuất xứ" options={mockOptions(['Việt Nam', 'Trung Quốc', 'Mỹ'])} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="supplier_id" label="Nhà cung cấp" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhà cung cấp" options={mockOptions(['Supplier A', 'Supplier B'])} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Mô tả sản phẩm">
        <TextArea rows={4} placeholder="Mô tả chi tiết, câu chuyện sản phẩm..." />
      </Form.Item>
      <Form.Item name="images" label="Ảnh chung sản phẩm" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
        <Upload.Dragger name="files" listType="picture-card" beforeUpload={() => false}> 
          <p className="ant-upload-drag-icon"><PlusOutlined /></p>
          <p className="ant-upload-text">Kéo & thả hoặc nhấn để chọn ảnh</p>
        </Upload.Dragger>
      </Form.Item>
      <Form.Item name="is_active" label="Trạng thái hoạt động" valuePropName="checked">
        <Switch defaultChecked />
      </Form.Item>

      <Divider orientation="left">Các biến thể sản phẩm (SKU)</Divider>

      <Radio.Group onChange={(e) => setCreationMode(e.target.value)} value={creationMode} style={{ marginBottom: 16 }}>
        <Radio.Button value="single">Tạo từng biến thể</Radio.Button>
        <Radio.Button value="bulk">Tạo hàng loạt</Radio.Button>
      </Radio.Group>

      {creationMode === 'single' && (
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8, border: '1px dashed #ccc', padding: 16 }} align="baseline">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'size']} label="Size" rules={[{ required: true }]}>
                        <Select placeholder="Size" options={mockOptions(['40', '41', '42', '43'])} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'color']} label="Màu sắc" rules={[{ required: true }]}>
                        <Select placeholder="Màu" options={mockOptions(['Trắng', 'Đen', 'Đỏ'])} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'cost_price']} label="Giá vốn" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} placeholder="Giá nhập" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'selling_price']} label="Giá bán" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} placeholder="Giá niêm yết" />
                      </Form.Item>
                    </Col>
                     <Col span={12}>
                    <Form.Item
                      {...restField}
                      name={[name, 'variant_images']}
                      label="Ảnh riêng"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)} 
                    >
                         <Upload beforeUpload={() => false} maxCount={3}>
                           <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                         </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm biến thể
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      )}

      {creationMode === 'bulk' && (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bulk_colors" label="Màu sắc" rules={[{ required: true }]}>
                <Select mode="multiple" allowClear placeholder="Chọn các màu" options={mockOptions(['Trắng', 'Đen', 'Đỏ'])} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bulk_sizes" label="Size" rules={[{ required: true }]}>
                <Select mode="multiple" allowClear placeholder="Chọn các size" options={mockOptions(['40', '41', '42', '43'])} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bulk_cost_price" label="Giá vốn (áp dụng cho tất cả)">
                <InputNumber style={{ width: '100%' }} placeholder="Giá nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bulk_selling_price" label="Giá bán (áp dụng cho tất cả)">
                <InputNumber style={{ width: '100%' }} placeholder="Giá niêm yết" />
              </Form.Item>
            </Col>
          </Row>
          <Divider>Bảng Preview Biến Thể</Divider>
          <Form.Item shouldUpdate={(prev, current) => prev.variants !== current.variants}>
            {({ getFieldValue }) => {
              const variants = getFieldValue('variants') || [];
              const columns = [
                { title: 'SKU (Preview)', dataIndex: 'sku', key: 'sku' },
                { title: 'Màu', dataIndex: 'color', key: 'color' },
                { title: 'Size', dataIndex: 'size', key: 'size' },
                { title: 'Giá vốn', dataIndex: 'cost_price', key: 'cost_price', editable: true },
                { title: 'Giá bán', dataIndex: 'selling_price', key: 'selling_price', editable: true },
              ].map(col => {
                if (!col.editable) return col;
                return {
                  ...col,
                  onCell: (record: any, index: number | undefined) => ({
                    record,
                    inputType: 'number',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: true, 
                    index,
                  }),
                };
              });

              return <Table components={{ body: { cell: EditableCell } }} bordered dataSource={variants} columns={columns} rowKey="key" pagination={false} />;
            }}
          </Form.Item>
        </div>
      )}

      <Row justify="end">
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu sản phẩm
          </Button>
        </Space>
      </Row>
    </Form>
  );
};

export default AddProductForm;