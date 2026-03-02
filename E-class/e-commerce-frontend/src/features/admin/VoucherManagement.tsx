import { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Button, Space, Typography, Input, Modal, Form,
  Select, InputNumber, DatePicker, Switch, notification, Card, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, SearchOutlined, GiftOutlined,
} from '@ant-design/icons';
import { voucherService } from '@/services/voucher.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUsage?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

const VoucherManagementPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();

  const fetchVouchers = useCallback(() => {
    setLoading(true);
    voucherService.getAll(page, pageSize)
      .then((res) => {
        setVouchers(res.data.content);
        setTotalElements(res.data.totalElements);
      })
      .catch(() => notification.error({ message: 'Lỗi tải danh sách voucher' }))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({ discountType: 'PERCENTAGE', isActive: true });
    setModalOpen(true);
  };

  const handleEdit = (record: Voucher) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    voucherService.delete(id)
      .then(() => {
        notification.success({ message: 'Đã xoá voucher' });
        fetchVouchers();
      })
      .catch(() => notification.error({ message: 'Lỗi khi xoá voucher' }));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DDTHH:mm:ss') : null,
      };

      const request = editingVoucher
        ? voucherService.update(editingVoucher.id, payload)
        : voucherService.create(payload);

      request
        .then(() => {
          notification.success({ message: editingVoucher ? 'Đã cập nhật voucher' : 'Đã tạo voucher mới' });
          setModalOpen(false);
          fetchVouchers();
        })
        .catch((err) => {
          notification.error({ message: 'Lỗi', description: err.response?.data?.message || 'Có lỗi xảy ra' });
        });
    });
  };

  const getStatusTag = (record: Voucher) => {
    const now = dayjs();
    if (!record.isActive) return <Tag color="default">Vô hiệu</Tag>;
    if (record.endDate && now.isAfter(dayjs(record.endDate))) return <Tag color="red">Hết hạn</Tag>;
    if (record.startDate && now.isBefore(dayjs(record.startDate))) return <Tag color="orange">Chưa bắt đầu</Tag>;
    if (record.maxUsage && record.usedCount >= record.maxUsage) return <Tag color="volcano">Hết lượt</Tag>;
    return <Tag color="green">Đang hoạt động</Tag>;
  };

  const filteredVouchers = keyword
    ? vouchers.filter((v) =>
        v.code.toLowerCase().includes(keyword.toLowerCase()) ||
        v.name.toLowerCase().includes(keyword.toLowerCase())
      )
    : vouchers;

  const columns = [
    {
      title: 'STT',
      width: 60,
      render: (_: any, __: any, index: number) => page * pageSize + index + 1,
    },
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      render: (code: string) => <Text strong style={{ color: '#0052D9' }}>{code}</Text>,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Loại giảm',
      dataIndex: 'discountType',
      width: 120,
      render: (type: string) =>
        type === 'PERCENTAGE'
          ? <Tag color="blue">Phần trăm</Tag>
          : <Tag color="green">Cố định</Tag>,
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      width: 120,
      render: (val: number, record: Voucher) =>
        record.discountType === 'PERCENTAGE'
          ? `${val}%`
          : `${val.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      width: 140,
      render: (val?: number) => val ? `${val.toLocaleString('vi-VN')}₫` : '—',
    },
    {
      title: 'Đã dùng / Tối đa',
      width: 140,
      render: (_: any, record: Voucher) => (
        <span>
          <Text strong>{record.usedCount}</Text>
          <Text type="secondary"> / {record.maxUsage ?? '∞'}</Text>
        </span>
      ),
    },
    {
      title: 'Thời gian',
      width: 200,
      render: (_: any, record: Voucher) => (
        <div style={{ fontSize: 12 }}>
          <div>{record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '—'}</div>
          <div style={{ color: '#999' }}>đến {record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '—'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      width: 130,
      render: (_: any, record: Voucher) => getStatusTag(record),
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_: any, record: Voucher) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#0052D9' }}
          />
          <Popconfirm
            title="Xoá voucher này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            <GiftOutlined style={{ marginRight: 8, color: '#0052D9' }} />
            Quản lý Voucher
          </Title>
          <Space>
            <Input
              placeholder="Tìm theo mã hoặc tên..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchVouchers}>Tải lại</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Thêm voucher
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredVouchers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            onChange: (p, ps) => { setPage(p - 1); setPageSize(ps); },
            showTotal: (total) => `Tổng ${total} voucher`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingVoucher ? 'Sửa voucher' : 'Thêm voucher mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingVoucher ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: 'Nhập mã voucher' }]}>
            <Input placeholder="VD: SUMMER50K" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item name="name" label="Tên voucher" rules={[{ required: true, message: 'Nhập tên voucher' }]}>
            <Input placeholder="VD: Giảm 50K mùa hè" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết voucher..." />
          </Form.Item>

          <Space size={16} style={{ width: '100%' }}>
            <Form.Item
              name="discountType"
              label="Loại giảm giá"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select
                options={[
                  { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                  { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (₫)' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="discountValue"
              label="Giá trị giảm"
              rules={[{ required: true, message: 'Nhập giá trị' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(v) => `${(v || 0).toLocaleString('vi-VN')}`}
                parser={(v) => Number((v || '').replace(/\./g, '').replace(/,/g, '')) as any}
              />
            </Form.Item>
          </Space>

          <Space size={16} style={{ width: '100%' }}>
            <Form.Item name="minOrderAmount" label="Đơn hàng tối thiểu (₫)" style={{ flex: 1 }}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={100000}
                formatter={(v) => `${(v || 0).toLocaleString('vi-VN')}`}
                parser={(v) => Number((v || '').replace(/\./g, '').replace(/,/g, '')) as any}
                placeholder="Không giới hạn"
              />
            </Form.Item>

            <Form.Item name="maxUsage" label="Số lượt sử dụng tối đa" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Không giới hạn" />
            </Form.Item>
          </Space>

          <Space size={16} style={{ width: '100%' }}>
            <Form.Item name="startDate" label="Ngày bắt đầu" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="endDate" label="Ngày kết thúc" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Space>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagementPage;
