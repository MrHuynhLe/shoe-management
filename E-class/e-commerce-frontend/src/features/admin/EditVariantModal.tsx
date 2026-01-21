import { Modal, Form, InputNumber, Button, Switch } from 'antd';
import { useEffect } from 'react';
import { Variant } from './VariantDetailModal'; 
 
interface EditVariantModalProps {
  open: boolean;
  variant: Variant | null;
  onCancel: () => void;
  onSave: (values: Variant) => void;
}
const EditVariantModal: React.FC<EditVariantModalProps> = ({ open, variant, onCancel, onSave }) => {
  const [form] = Form.useForm();

 useEffect(() => {
  if (!open) return;     
  if (!variant) return;

  form.setFieldsValue({
    selling_price: variant.selling_price,
    is_active: variant.is_active,
  });
}, [open, variant, form]);

  const handleSave = () => {
    form.validateFields().then(values => {

      if (variant) {
        onSave({ ...variant, ...values });
      }
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin biến thể"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      destroyOnHidden 
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="selling_price"
          label="Giá bán"
          rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\s?|(,*)/g, '')} 
          />
        </Form.Item>
        <Form.Item
          name="is_active"
          label="Trạng thái"
          valuePropName="checked" 
        >
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng hoạt động" /> 
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditVariantModal;