import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Tooltip } from "antd";
import { useState, useRef } from "react";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
} from "@ant-design/pro-form";
import { couponService, CouponRequest } from "@/services/coupon.service";

interface Coupon {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  usageLimit: number;
  isActive: boolean;
}

const CouponManagementPage = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const actionRef = useRef<ActionType>(null);

  const handleAdd = () => {
    setEditingCoupon(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await couponService.delete(id);
      message.success("Vô hiệu hóa mã giảm giá thành công");
      actionRef.current?.reload();
    } catch (error) {
      message.error("Vô hiệu hóa thất bại");
    }
  };

  const handleSubmit = async (values: CouponRequest) => {
    try {
      const payload: CouponRequest = {
        ...values,
        code: values.code.trim().toUpperCase(),
      };

      if (editingCoupon) {
        await couponService.update(editingCoupon.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await couponService.create(payload);
        message.success("Thêm mới thành công");
      }

      setModalVisible(false);
      setEditingCoupon(null);
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Đã có lỗi xảy ra");
      return false;
    }
  };

  const columns: ProColumns<Coupon>[] = [
    { title: "ID", dataIndex: "id", width: 48, search: false },
    { title: "Mã giảm giá", dataIndex: "code", copyable: true },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      align: "center",
      valueType: "select",
      valueEnum: {
        PERCENTAGE: { text: "Phần trăm (%)" },
        FIXED_AMOUNT: { text: "Số tiền cố định" },
      },
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discountValue",
      search: false,
      align: "right",
      render: (_, record) => {
        if (record.discountType === "PERCENTAGE") {
          return `${record.discountValue}%`;
        }
        return `${record.discountValue.toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Lượt sử dụng",
      dataIndex: "usageLimit",
      align: "center",
      search: false,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        true: { text: "Hoạt động", status: "Success" },
        false: { text: "Không hoạt động", status: "Default" },
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      align: "center",
      render: (_, record) => [
        <Tooltip title="Sửa" key="edit">
          <Button
            icon={<EditOutlined />}
            shape="circle"
            onClick={() => handleEdit(record)}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Vô hiệu hóa mã này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Tooltip title="Vô hiệu hóa">
            <Button icon={<DeleteOutlined />} shape="circle" danger />
          </Tooltip>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Coupon>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await couponService.getAll({
            page: params.current ? params.current - 1 : 0,
            size: params.pageSize || 10,
            ...params,
          });
          return {
            data: response.data.content,
            success: true,
            total: response.data.totalElements,
          };
        }}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        headerTitle="Quản lý mã giảm giá (Coupon)"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm mã giảm giá
          </Button>,
        ]}
      />
      <ModalForm
        title={editingCoupon ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá mới"}
        width="500px"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        initialValues={
          editingCoupon || {
            isActive: true,
            discountType: "FIXED_AMOUNT",
            usageLimit: 1,
          }
        }
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditingCoupon(null),
        }}
      >
        <ProFormText
          name="code"
          label="Mã giảm giá"
          placeholder="Ví dụ: SALE10"
          rules={[
            { required: true, message: "Vui lòng nhập mã giảm giá" },
            { min: 3, message: "Mã phải có ít nhất 3 ký tự" },
          ]}
        />
        <ProFormSelect
          name="discountType"
          label="Loại giảm giá"
          rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
          options={[
            { label: "Số tiền cố định", value: "FIXED_AMOUNT" },
            { label: "Phần trăm (%)", value: "PERCENTAGE" },
          ]}
        />
        <ProFormDigit
          name="discountValue"
          label="Giá trị giảm"
          min={1}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
        />
        <ProFormDigit
          name="usageLimit"
          label="Giới hạn lượt sử dụng"
          min={1}
          fieldProps={{ precision: 0 }}
          rules={[
            { required: true, message: "Vui lòng nhập giới hạn sử dụng" },
          ]}
        />
        <ProFormSwitch name="isActive" label="Kích hoạt" />
      </ModalForm>
    </>
  );
};

export default CouponManagementPage;
