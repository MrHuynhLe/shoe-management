import { useState, useRef } from 'react';
import { Tag, Space, Button, message, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { adminOrderService } from '@/services/admin.order.service';
import dayjs from 'dayjs';

interface Order {
  id: number;
  code: string;
  customerName: string; 
  totalAmount: number;
  status: string;
  createdAt: string;
}

const OrderManagementPage = () => {
   const actionRef = useRef<ActionType>(null);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, status);
      message.success('Cập nhật trạng thái thành công');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="orange">Chờ xử lý</Tag>;
      case 'SHIPPING':
        return <Tag color="blue">Đang giao hàng</Tag>;
      case 'COMPLETED':
        return <Tag color="green">Hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ProColumns<Order>[] = [
    { title: 'ID', dataIndex: 'id', width: 48, search: false },
    { title: 'Mã đơn hàng', dataIndex: 'code', copyable: true },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      search: false,
      render: (_, record) => record.totalAmount.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      render: (_, record) => dayjs(record.createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        PENDING: { text: 'Chờ xử lý', status: 'Warning' },
        SHIPPING: { text: 'Đang giao hàng', status: 'Processing' },
        COMPLETED: { text: 'Hoàn thành', status: 'Success' },
        CANCELLED: { text: 'Đã hủy', status: 'Error' },
      },
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Tooltip title="Xem chi tiết" key="view">
          <Button icon={<EyeOutlined />} shape="circle" />
        </Tooltip>,
        record.status === 'PENDING' && (
          <Popconfirm
            key="confirm"
            title="Xác nhận đơn hàng này?"
            description="Trạng thái sẽ chuyển sang Đang giao hàng"
            onConfirm={() => handleUpdateStatus(record.id, 'SHIPPING')}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Xác nhận & Giao hàng">
              <Button type="primary" icon={<CheckCircleOutlined />} shape="circle" />
            </Tooltip>
          </Popconfirm>
        ),
        record.status === 'SHIPPING' && (
             <Popconfirm
            key="complete"
            title="Hoàn thành đơn hàng?"
            onConfirm={() => handleUpdateStatus(record.id, 'COMPLETED')}
            okText="Đồng ý"
            cancelText="Hủy"
          >
          <Tooltip title="Hoàn thành">
            <Button icon={<CarOutlined />} shape="circle" style={{ color: 'green', borderColor: 'green' }} />
          </Tooltip>
          </Popconfirm>
        ),
      ],
    },
  ];

  return (
    <ProTable<Order>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const response = await adminOrderService.getAllOrders({ ...params, page: (params.current || 1) - 1, size: params.pageSize || 10 });
        return { data: response.data.content, success: true, total: response.data.totalElements };
      }}
      rowKey="id"
      headerTitle="Quản lý đơn hàng"
    />
  );
};

export default OrderManagementPage;