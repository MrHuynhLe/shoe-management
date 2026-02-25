import {
  Layout,
  Menu,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  message,
  Popconfirm,
  Switch,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { userService } from "@/services/user.service";
import type { User, PageResponse } from "@/features/user/user.model";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const UserManagementPage = () => {
  // ✅ BỎ collapse button dưới sidebar => không cần state collapsed nữa
  // const [collapsed, setCollapsed] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  const [form] = Form.useForm();

  // ===== Fetch roles =====
  const fetchRoles = async () => {
    try {
      const res = await userService.getRoles();
      setRoles(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch {
      message.error("Không tải được vai trò");
    }
  };

  // ===== Fetch users =====
  const fetchUsers = async (keyword?: string) => {
    try {
      setLoading(true);
      const res = await userService.getUsers(page, size, keyword);
      const data: PageResponse<User> = res.data;

      setUsers(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error("Không thể tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers(searchText?.trim() ? searchText.trim() : undefined);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    fetchUsers(searchText?.trim() ? searchText.trim() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // lọc role client-side
  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;

    const roleName = roles.find((r) => r.id === roleFilter)?.name;
    if (!roleName) return users;

    return users.filter(
      (u) => (u.role || "").toLowerCase() === roleName.toLowerCase()
    );
  }, [users, roleFilter, roles]);

  const handleStatusChange = async (id: number, isActive: boolean) => {
    const old = [...users];
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive } : u)));

    try {
      await userService.updateStatus(id, isActive);
      message.success("Cập nhật trạng thái thành công");
    } catch {
      setUsers(old);
      message.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      message.success("Đã xóa người dùng");
      fetchUsers(searchText?.trim() ? searchText.trim() : undefined);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xóa thất bại");
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setOpenModal(true);
  };

  const openEdit = async (record: User) => {
    try {
      const res = await userService.getUserById(record.id);
      const d = res.data;

      setEditingUser({ ...record, ...d });

      form.setFieldsValue({
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        address: d.address,
        birthday: d.birthday || undefined,
        roleId: d.roleId,
        salary: d.salary,
      });

      setOpenModal(true);
    } catch {
      message.error("Không tải được dữ liệu để sửa");
    }
  };

  const openView = async (id: number) => {
    try {
      const res = await userService.getUserById(id);
      setDetailData(res.data);
      setOpenDetail(true);
    } catch {
      message.error("Không tải được chi tiết");
    }
  };

  const normalizeBirthday = (b: any) =>
    b ? (typeof b === "string" ? b : b.format?.("YYYY-MM-DD")) : null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (editingUser) {
        const updatePayload = {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          birthday: normalizeBirthday(values.birthday),
          roleId: values.roleId,
          salary: values.salary,
        };

        await userService.updateUser(editingUser.id, updatePayload);
        message.success("Cập nhật thành công");
      } else {
        const createPayload = {
          username: values.username,
          password: values.password,
          email: values.email,
          roleId: values.roleId,
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          birthday: normalizeBirthday(values.birthday),
          salary: values.salary,
        };

        await userService.createUser(createPayload);
        message.success("Thêm người dùng thành công");
        setPage(0);
      }

      setOpenModal(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers(searchText?.trim() ? searchText.trim() : undefined);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleNameById = (roleId: number) =>
    roles.find((r) => r.id === roleId)?.name || "Không xác định";

  const statusTag = (active: boolean) => (
    <Tag
      color={active ? "green" : "red"}
      style={{ padding: "4px 10px", borderRadius: 6 }}
    >
      {active ? "Đang hoạt động" : "Ngừng hoạt động"}
    </Tag>
  );

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Tên", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 170,
      render: (_: any, record: User) => (
        <Space>
          {statusTag(!!record.isActive)}
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleStatusChange(record.id, checked)}
          />
        </Space>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>

          <Tooltip title="Xem">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openView(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
     
      <Layout>
        
        <Content style={{ padding: 18, background: "#f5f7fb" }}>
          {/* ===== Toolbar ===== */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 14,
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
              marginBottom: 14,
            }}
          >
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Thêm người dùng
              </Button>

              <Button
                icon={<EditOutlined />}
                disabled={!editingUser}
                onClick={() => editingUser && openEdit(editingUser)}
              >
                Sửa người dùng
              </Button>

              <Button danger icon={<DeleteOutlined />} disabled>
                Xóa người dùng
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={() => message.info("Chưa làm export")}
              >
                Xuất dữ liệu
              </Button>
            </Space>

            {/* ===== Filter row ===== */}
            <div style={{ marginTop: 14 }}>
              <Text strong>Tìm kiếm:</Text>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <Input
                  placeholder="Tên hoặc Email"
                  style={{ width: 320 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />

                <Select
                  placeholder="Vai trò"
                  style={{ width: 240 }}
                  allowClear
                  value={roleFilter}
                  onChange={(v) => setRoleFilter(v)}
                  options={roles.map((r) => ({ value: r.id, label: r.name }))}
                />

                <Button
                  type="primary"
                  onClick={() => {
                    setPage(0);
                    fetchUsers(searchText?.trim() ? searchText.trim() : undefined);
                  }}
                >
                  Lọc
                </Button>
              </div>
            </div>
          </div>

          {/* ===== Table ===== */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 14,
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
            }}
          >
            <Table
              columns={columns as any}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page + 1,
                pageSize: size,
                total,
                onChange: (p, s) => {
                  setPage(p - 1);
                  setSize(s);
                },
                showSizeChanger: true,
              }}
            />
          </div>

          {/* ===== Modal Create/Update ===== */}
          <Modal
            title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
            open={openModal}
            onOk={handleSubmit}
            confirmLoading={submitting}
            onCancel={() => {
              setOpenModal(false);
              form.resetFields();
              setEditingUser(null);
            }}
          >
            <Form form={form} layout="vertical">
              {!editingUser && (
                <>
                  <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                      { required: true, message: "Tên đăng nhập không được để trống" },
                      { min: 4, message: "Tối thiểu 4 ký tự" },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: "Mật khẩu không được để trống" },
                      { min: 6, message: "Tối thiểu 6 ký tự" },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Không được để trống" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email không được để trống" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: "Không được để trống" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input />
              </Form.Item>

              <Form.Item name="birthday" label="Ngày sinh">
                <Input type="date" />
              </Form.Item>

              <Form.Item
                name="roleId"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  {roles.map((role) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="salary"
                label="Lương"
                rules={[
                  { required: true, message: "Không được để trống" },
                  {
                    validator: (_, value) =>
                      value >= 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("Lương phải >= 0")),
                  },
                ]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Form>
          </Modal>

          {/* ===== Modal Detail ===== */}
          <Modal
            title="Chi tiết người dùng"
            open={openDetail}
            onCancel={() => setOpenDetail(false)}
            footer={null}
          >
            {detailData && (
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <b>Tên đăng nhập:</b> {detailData.username}
                </div>
                <div>
                  <b>Họ tên:</b> {detailData.fullName}
                </div>
                <div>
                  <b>Email:</b> {detailData.email}
                </div>
                <div>
                  <b>SĐT:</b> {detailData.phone}
                </div>
                <div>
                  <b>Địa chỉ:</b> {detailData.address}
                </div>
                <div>
                  <b>Ngày sinh:</b> {detailData.birthday}
                </div>
                <div>
                  <b>Lương:</b> {detailData.salary}
                </div>
                <div>
                  <b>Vai trò:</b> {getRoleNameById(detailData.roleId)}
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  {detailData.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </div>
              </Space>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserManagementPage;