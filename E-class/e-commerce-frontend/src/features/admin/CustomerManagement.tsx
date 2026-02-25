import { useState } from 'react';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Tooltip, Space, Modal, Form, Input, notification, InputRef } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    email: 'mai.nt@email.com',
    phone: '0911223344',
    address: '123 Đường A, Quận B, TP. HCM',
    registrationDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Trần Minh Khôi',
    email: 'khoi.tm@email.com',
    phone: '0922334455',
    address: '456 Đường C, Quận D, Hà Nội',
    registrationDate: '2024-02-20',
  },
  {
    id: 3,
    name: 'Lê Anh Dũng',
    email: 'dung.la@email.com',
    phone: '0933445566',
    address: '789 Đường E, Quận F, Đà Nẵng',
    registrationDate: '2024-03-10',
  },
];

const CustomerManagementPage = () => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const handleViewClick = (record: Customer) => {
    setSelectedCustomer(record);
    form.setFieldsValue(record);
    setIsDetailModalOpen(true);
  };

  const handleCancel = () => {
    setIsDetailModalOpen(false);
    setSelectedCustomer(null);
  };

  const getColumnSearchProps = (dataIndex: keyof Customer): Partial<ProColumns<Customer>> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
        : false,
  });

  const columns: ProColumns<Customer>[] = [
    { title: 'ID', dataIndex: 'id', width: 48 },
    { title: 'Tên khách hàng', dataIndex: 'name', copyable: true, ...getColumnSearchProps('name') },
    { title: 'Email', dataIndex: 'email', copyable: true, ...getColumnSearchProps('email') },
    { title: 'Số điện thoại', dataIndex: 'phone', copyable: true, ...getColumnSearchProps('phone') },
    { title: 'Địa chỉ', dataIndex: 'address', ...getColumnSearchProps('address') },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registrationDate',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Tooltip title="Xem chi tiết khách hàng" key="view">
          <Button icon={<EyeOutlined />} shape="circle" onClick={() => handleViewClick(record)} />
        </Tooltip>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Customer>
        columns={columns}
        dataSource={mockCustomers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      headerTitle="Danh sách khách hàng" 
      search={false}
      />
      <Modal
        title="Thông tin chi tiết khách hàng"
        open={isDetailModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={selectedCustomer || {}} disabled>
          <Form.Item name="name" label="Tên khách hàng">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="registrationDate" label="Ngày đăng ký">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerManagementPage;