import { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip, Space, Modal, Form, Input, Select, notification } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'sales' | 'warehouse';
  status: 'active' | 'inactive';
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'Trần Văn An',
    position: 'Quản lý bán hàng',
    email: 'an.tv@sshop.vn',
    phone: '0912345678',
    address: '123 Đường ABC, Quận 1, TP. HCM',
    role: 'admin',
    status: 'active',
  },
  {
    id: 2,
    name: 'Lê Thị Bình',
    position: 'Nhân viên kho',
    email: 'binh.lt@sshop.vn',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận 2, TP. HCM',
    role: 'warehouse',
    status: 'active',
  },
  {
    id: 3,
    name: 'Phạm Hùng Cường',
    position: 'Nhân viên bán hàng',
    email: 'cuong.ph@sshop.vn',
    phone: '0905123456',
    address: '789 Đường DEF, Quận 3, TP. HCM',
    role: 'sales',
    status: 'inactive',
  },
];

const EmployeeManagementPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const handleEditClick = (record: Employee) => {
    setEditingEmployee(record);
    form.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('Saving employee:', { ...editingEmployee, ...values });
      notification.success({ message: 'Cập nhật thành công!' });
      handleCancel();
    } catch (error) {
      console.log('Validation Failed:', error);
    }
  };

  const columns: ProColumns<Employee>[] = [
    { title: 'ID', dataIndex: 'id', width: 48, search: false },
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      copyable: true,
      fieldProps: { placeholder: 'Tìm theo tên, email, SĐT...' },
    },
    { title: 'Chức vụ', dataIndex: 'position', search: false },
    { title: 'Email', dataIndex: 'email', copyable: true, search: false },
    { title: 'Số điện thoại', dataIndex: 'phone', copyable: true, search: false },
    { title: 'Địa chỉ', dataIndex: 'address', search: false },
    {
      title: 'Phân quyền',
      dataIndex: 'role',
      valueType: 'select',
      search: false,
      valueEnum: {
        admin: { text: 'Quản lý' },
        sales: { text: 'Nhân viên bán hàng' },
        warehouse: { text: 'Nhân viên kho' },
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Hoạt động', status: 'Success' },
        inactive: { text: 'Ngừng hoạt động', status: 'Default' },
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Tooltip title="Sửa thông tin" key="edit">
          <Button icon={<EditOutlined />} shape="circle" onClick={() => handleEditClick(record)} />
        </Tooltip>,
        <Tooltip title="Xóa nhân viên" key="delete"> 
          <Button icon={<DeleteOutlined />} shape="circle" danger />
        </Tooltip>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Employee>
        columns={columns}
        dataSource={mockEmployees}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        headerTitle="Danh sách nhân viên"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Thêm nhân viên
          </Button>,
        ]}
      />
      <Modal
        title="Chỉnh sửa thông tin nhân viên"
        open={isEditModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={editingEmployee || {}}>
          <Form.Item name="name" label="Tên nhân viên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Chức vụ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Phân quyền" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Quản lý</Select.Option>
              <Select.Option value="sales">Nhân viên bán hàng</Select.Option>
              <Select.Option value="warehouse">Nhân viên kho</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeManagementPage;