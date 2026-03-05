import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Tag, Space, Typography, Tooltip } from 'antd';
import { useState, useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormSelect, ProFormDigit, ProFormSwitch, ProFormDateTimeRangePicker } from '@ant-design/pro-form';
import { promotionService, PromotionRequest } from '@/services/promotion.service';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const PromotionManagementPage = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
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
      message.success('Vô hiệu hóa chương trình thành công');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Vô hiệu hóa thất bại');
    }
  };

  const handleSubmit = async (values: Omit<PromotionRequest, 'startDate' | 'endDate'> & { dateRange?: [string, string] }) => {
    const { dateRange, ...rest } = values;
    const payload: PromotionRequest = {
      ...rest,
      startDate: dateRange ? dayjs(dateRange[0]).toISOString() : undefined,
      endDate: dateRange ? dayjs(dateRange[1]).toISOString() : undefined,
    };

    try {
      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await promotionService.create(payload);
        message.success('Thêm mới thành công');
      }
      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Đã có lỗi xảy ra');
      return false;
    }
  };

  const columns: ProColumns<Promotion>[] = [
    { title: 'ID', dataIndex: 'id', width: 48, search: false },
    { title: 'Mã', dataIndex: 'code', copyable: true },
    { title: 'Tên chương trình', dataIndex: 'name', ellipsis: true },
    {
      title: 'Loại giảm',
      dataIndex: 'discountType',
      align: 'center',
      valueType: 'select',
      valueEnum: {
        PERCENTAGE: { text: 'Phần trăm (%)' },
        FIXED_AMOUNT: { text: 'Số tiền cố định' },
      },
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      search: false,
      align: 'right',
      render: (_, record) => {
        if (record.discountType === 'PERCENTAGE') {
          return `${record.discountValue}%`;
        }
        return `${record.discountValue.toLocaleString('vi-VN')} ₫`;
      },
    },
    {
      title: 'Điều kiện',
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.minOrderValue > 0 && <Text>Đơn tối thiểu: {record.minOrderValue.toLocaleString('vi-VN')} ₫</Text>}
          {record.maxDiscountAmount > 0 && <Text>Giảm tối đa: {record.maxDiscountAmount.toLocaleString('vi-VN')} ₫</Text>}
        </Space>
      ),
    },
    {
      title: 'Hiệu lực',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</Text>
          <Text>Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      valueType: 'select',
      valueEnum: {
        true: { text: 'Hoạt động', status: 'Success' },
        false: { text: 'Không hoạt động', status: 'Default' },
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Tooltip title="Sửa" key="edit">
          <Button icon={<EditOutlined />} shape="circle" onClick={() => handleEdit(record)} />
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
        headerTitle="Quản lý chương trình khuyến mãi"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm chương trình
          </Button>,
        ]}
      />
      <ModalForm
        title={editingPromotion ? 'Cập nhật chương trình' : 'Thêm chương trình mới'}
        width="600px"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        initialValues={
          editingPromotion
            ? {
                ...editingPromotion,
                dateRange: [dayjs(editingPromotion.startDate), dayjs(editingPromotion.endDate)],
              }
            : { isActive: true, discountType: 'FIXED_AMOUNT' }
        }
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditingPromotion(null),
        }}
      >
        <ProFormText name="name" label="Tên chương trình" rules={[{ required: true }]} />
        <ProFormText name="code" label="Mã chương trình (Khách hàng nhập)" rules={[{ required: true }]} />
        <ProFormSelect
          name="discountType"
          label="Loại giảm giá"
          options={[
            { label: 'Số tiền cố định', value: 'FIXED_AMOUNT' },
            { label: 'Phần trăm (%)', value: 'PERCENTAGE' },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormDigit name="discountValue" label="Giá trị giảm" rules={[{ required: true }]} />
        <ProFormDigit name="minOrderValue" label="Giá trị đơn hàng tối thiểu" />
        <ProFormDigit name="maxDiscountAmount" label="Giảm giá tối đa (cho loại %)" />
        <ProFormDateTimeRangePicker name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true }]} />
        <ProFormDigit name="usageLimit" label="Giới hạn lượt sử dụng (bỏ trống nếu không giới hạn)" />
        <ProFormSwitch name="isActive" label="Kích hoạt" />
      </ModalForm>
    </>
  );
};

export default PromotionManagementPage;