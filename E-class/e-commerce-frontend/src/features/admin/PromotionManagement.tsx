import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  message,
  Popconfirm,
  Tag,
  Space,
  Typography,
  Tooltip,
} from "antd";
import { useState, useRef } from "react";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormDateTimeRangePicker,
} from "@ant-design/pro-form";
import {
  promotionService,
  PromotionRequest,
} from "@/services/promotion.service";
import dayjs from "dayjs";

const { Text } = Typography;

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chưa thiết lập";
  const parsed = dayjs(value);
  return parsed.isValid()
    ? parsed.format("DD/MM/YYYY HH:mm")
    : "Chưa thiết lập";
};

const formatUsageNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "Không giới hạn";
  return value.toLocaleString("vi-VN");
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(1)}%`;
};

const getPromotionStatus = (record: Promotion) => {
  const now = dayjs();
  const start = record.startDate ? dayjs(record.startDate) : null;
  const end = record.endDate ? dayjs(record.endDate) : null;

  if (!record.isActive) {
    return { label: "Tạm tắt", color: "default" as const };
  }

  if (
    record.usageLimit !== null &&
    record.remainingCount !== null &&
    record.remainingCount <= 0
  ) {
    return { label: "Hết lượt dùng", color: "orange" as const };
  }

  if (start && start.isValid() && now.isBefore(start)) {
    return { label: "Sắp diễn ra", color: "blue" as const };
  }

  if (end && end.isValid() && now.isAfter(end)) {
    return { label: "Đã hết hạn", color: "red" as const };
  }

  return { label: "Đang diễn ra", color: "green" as const };
};

const getPromotionStatusPriority = (record: Promotion) => {
  const status = getPromotionStatus(record).label;

  switch (status) {
    case "Đang diễn ra":
      return 1;
    case "Sắp diễn ra":
      return 2;
    case "Hết lượt dùng":
      return 3;
    case "Đã hết hạn":
      return 4;
    case "Tạm tắt":
      return 5;
    default:
      return 99;
  }
};

const sortPromotions = (items: Promotion[]) => {
  return [...items].sort((a, b) => {
    const priorityA = getPromotionStatusPriority(a);
    const priorityB = getPromotionStatusPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const startA = a.startDate
      ? dayjs(a.startDate).valueOf()
      : Number.MAX_SAFE_INTEGER;
    const startB = b.startDate
      ? dayjs(b.startDate).valueOf()
      : Number.MAX_SAFE_INTEGER;

    return startA - startB;
  });
};

interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;

  issuedQuantity: number | null;
  usedCount: number;
  remainingCount: number | null;
  usedPercent: number | null;
  remainingPercent: number | null;
}
const PromotionManagementPage = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const actionRef = useRef<ActionType>(null);

  const handleAdd = () => {
    setEditingPromotion(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await promotionService.delete(id);
      message.success("Vô hiệu hóa chương trình thành công");
      actionRef.current?.reload();
    } catch (error) {
      message.error("Vô hiệu hóa thất bại");
    }
  };

  const handleSubmit = async (
    values: Omit<PromotionRequest, "startDate" | "endDate"> & {
      dateRange?: [string, string];
    },
  ) => {
    const { dateRange, ...rest } = values;
    const payload: PromotionRequest = {
      ...rest,
      startDate: dateRange ? dayjs(dateRange[0]).toISOString() : undefined,
      endDate: dateRange ? dayjs(dateRange[1]).toISOString() : undefined,
    };

    try {
      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await promotionService.create(payload);
        message.success("Thêm mới thành công");
      }
      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Đã có lỗi xảy ra");
      return false;
    }
  };

  const columns: ProColumns<Promotion>[] = [
    {
      title: "STT",
      valueType: "index",
      width: 60,
      search: false,
      align: "center",
    },
    {
      title: "Mã",
      dataIndex: "code",
      width: 130,
      copyable: true,
    },
    {
      title: (
        <Tooltip title="Tên chương trình">
          <span>Tên CTKM</span>
        </Tooltip>
      ),
      dataIndex: "name",
      width: 180,
      render: (_, record) => (
        <Tooltip title={record.name}>
          <Text ellipsis style={{ maxWidth: 160, display: "inline-block" }}>
            {record.name}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      width: 120,
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
      width: 110,
      search: false,
      align: "right",
      render: (_, record) =>
        record.discountType === "PERCENTAGE"
          ? `${record.discountValue}%`
          : `${record.discountValue?.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Điều kiện",
      dataIndex: "condition",
      width: 190,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <Text type="secondary">Tối thiểu: </Text>
            <Text strong>
              {record.minOrderValue?.toLocaleString("vi-VN")} ₫
            </Text>
          </Text>
          <Text>
            <Text type="secondary">Tối đa: </Text>
            <Text strong>
              {record.maxDiscountAmount && record.maxDiscountAmount > 0
                ? `${record.maxDiscountAmount.toLocaleString("vi-VN")} ₫`
                : "Không giới hạn"}
            </Text>
          </Text>
        </Space>
      ),
    },
    {
      title: "Phát hành",
      dataIndex: "issuedQuantity",
      width: 100,
      search: false,
      align: "center",
      render: (_, record) => (
        <Text>{formatUsageNumber(record.issuedQuantity)}</Text>
      ),
    },
    {
      title: "Đã dùng",
      dataIndex: "usedCount",
      width: 90,
      search: false,
      align: "center",
      render: (_, record) => (
        <Text>{record.usedCount?.toLocaleString("vi-VN") ?? 0}</Text>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingCount",
      width: 90,
      search: false,
      align: "center",
      render: (_, record) => (
        <Text>{formatUsageNumber(record.remainingCount)}</Text>
      ),
    },
    {
      title: "Tỉ lệ dùng",
      dataIndex: "usedPercent",
      width: 140,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>Dùng: {formatPercent(record.usedPercent)}</Text>
          <Text type="secondary">
            Còn: {formatPercent(record.remainingPercent)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Hiệu lực",
      dataIndex: "dateRange",
      width: 180,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>Từ {formatDateTime(record.startDate)}</Text>
          <Text type="secondary">Đến {formatDateTime(record.endDate)}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      search: false,
      align: "center",
      render: (_, record) => {
        const status = getPromotionStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
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
          title="Vô hiệu hóa chương trình?"
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
      <ProTable<Promotion>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await promotionService.getAll({
            page: (params.current || 1) - 1,
            size: params.pageSize || 10,
            code: params.code,
            name: params.name,
            discountType: params.discountType,
          });

          const pageData = response.data;
          const sortedData = sortPromotions(pageData.content || []);

          return {
            data: sortedData,
            success: true,
            total: pageData.totalElements || 0,
          };
        }}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        headerTitle="Quản lý chương trình khuyến mãi"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm chương trình
          </Button>,
        ]}
      />
      <ModalForm
        title={
          editingPromotion ? "Cập nhật chương trình" : "Thêm chương trình mới"
        }
        width="600px"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        initialValues={
          editingPromotion
            ? {
                ...editingPromotion,
                dateRange:
                  editingPromotion.startDate && editingPromotion.endDate
                    ? [
                        dayjs(editingPromotion.startDate),
                        dayjs(editingPromotion.endDate),
                      ]
                    : undefined,
              }
            : { isActive: true, discountType: "FIXED_AMOUNT" }
        }
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditingPromotion(null),
        }}
      >
        <ProFormText
          name="name"
          label="Tên chương trình"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="code"
          label="Mã chương trình (Khách hàng nhập)"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="discountType"
          label="Loại giảm giá"
          options={[
            { label: "Số tiền cố định", value: "FIXED_AMOUNT" },
            { label: "Phần trăm (%)", value: "PERCENTAGE" },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="discountValue"
          label="Giá trị giảm"
          rules={[{ required: true }]}
        />
        <ProFormDigit name="minOrderValue" label="Giá trị đơn hàng tối thiểu" />
        <ProFormDigit
          name="maxDiscountAmount"
          label="Giảm giá tối đa (cho loại %)"
        />
        <ProFormDateTimeRangePicker
          name="dateRange"
          label="Thời gian hiệu lực"
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="usageLimitPerCustomer"
          label="Giới hạn lượt sử dụng / khách hàng"
          placeholder="Bỏ trống nếu không giới hạn"
        />
        <ProFormDigit
          name="usageLimit"
          label="Giới hạn lượt sử dụng (bỏ trống nếu không giới hạn)"
        />
        <ProFormSwitch name="isActive" label="Kích hoạt" />
      </ModalForm>
    </>
  );
};

export default PromotionManagementPage;
