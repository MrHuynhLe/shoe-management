import { Modal, Form, Input, InputNumber, Switch } from "antd";
import { useEffect } from "react";
import { ProductVariantUpdatePayload } from "@/services/product.service";

export interface Variant {
  id: number;
  code: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
  attributes?: Record<string, string>;
}

interface EditVariantModalProps {
  open: boolean;
  variant: Variant | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSave: (variantId: number, values: ProductVariantUpdatePayload) => Promise<void> | void;
}

const EditVariantModal: React.FC<EditVariantModalProps> = ({
  open,
  variant,
  confirmLoading = false,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open || !variant) {
      return;
    }

    form.setFieldsValue({
      code: variant.code,
      costPrice: variant.costPrice,
      sellingPrice: variant.sellingPrice,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
    });
  }, [open, variant, form]);

  const handleSave = async () => {
    const values = await form.validateFields();

    if (!variant) {
      return;
    }

    await onSave(variant.id, {
      code: values.code,
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      stockQuantity: values.stockQuantity,
      isActive: values.isActive,
    });

    form.resetFields();
  };

  return (
    <Modal
      title="Chỉnh sửa biến thể"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={confirmLoading}
      destroyOnHidden
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="code"
          label="SKU / Mã biến thể"
          rules={[{ required: true, message: "Vui lòng nhập mã biến thể" }]}
        >
          <Input placeholder="VD: NIKE-AF1-TRANG-42" />
        </Form.Item>

        <Form.Item
          name="costPrice"
          label="Giá nhập"
          rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number((value || "").replace(/,/g, "")) as any}
          />
        </Form.Item>

        <Form.Item
          name="sellingPrice"
          label="Giá bán"
          rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number((value || "").replace(/,/g, "")) as any}
          />
        </Form.Item>

        <Form.Item
          name="stockQuantity"
          label="Tồn kho"
          rules={[{ required: true, message: "Vui lòng nhập tồn kho" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} precision={0} />
        </Form.Item>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng bán" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditVariantModal;
