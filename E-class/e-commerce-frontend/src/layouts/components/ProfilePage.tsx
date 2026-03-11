import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, DatePicker, message, Spin, Row, Col, Typography } from 'antd';
import { userService } from '@/services/user.service';
import moment from 'moment';
import { ProfileUpdateRequest } from '../../services/user.model';

const { Title } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getMyProfile();
        const data = response.data;
        setProfile(data);
        form.setFieldsValue({
          ...data,
          birthday: data.birthday ? moment(data.birthday, 'YYYY-MM-DD') : null,
        });
      } catch (error) {
        message.error('Không thể tải thông tin cá nhân. Vui lòng thử lại.');
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const updateData: ProfileUpdateRequest = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
      };

      await userService.updateMyProfile(updateData);
      message.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '40px' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>Thông tin tài khoản</Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                ...profile,
                birthday: profile?.birthday ? moment(profile.birthday, 'YYYY-MM-DD') : null,
              }}
            >
              <Form.Item name="username" label="Tên đăng nhập">
                <Input readOnly />
              </Form.Item>

              <Form.Item name="email" label="Email">
                <Input readOnly />
              </Form.Item>

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input placeholder="Nhập họ và tên của bạn" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ của bạn" />
              </Form.Item>

              <Form.Item name="birthday" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;