import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { authService, getErrorMessage, getFieldErrors } from '../../services/authService';
import { Link } from 'react-router-dom';
const { Title, Text } = Typography;

interface FormValues extends RegisterRequest {
    confirmPassword: string;
}

export default function Register() {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: FormValues) => {
        setLoading(true);
        setError(null);
        try {
            const { confirmPassword, ...payload } = values;
            void confirmPassword;
            const data = await authService.register(payload);
            message.success(`Đăng ký thành công, chào ${data.user.fullName}`);
            // TODO: điều hướng sau khi có router
        } catch (err) {
            const fieldErrors = getFieldErrors(err);
            const entries = Object.entries(fieldErrors);
            if (entries.length > 0) {
                form.setFields(entries.map(([name, msg]) => ({ name, errors: [msg] })));
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={wrapper}>
            <Card style={{ width: '100%', maxWidth: 460 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 4 }}>Đăng ký tài khoản</Title>
                    <Text type="secondary">Tạo tài khoản khách hàng</Text>
                </div>

                {error && (
                    <Alert
                        type="error"
                        showIcon
                        message={error}
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không đúng định dạng' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ pattern: /^(0|\+84)[0-9]{9}$/, message: 'Số điện thoại không hợp lệ' }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="0912345678" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 8, message: 'Mật khẩu phải từ 8 ký tự' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                        Đăng ký
                    </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Đã có tài khoản? </Text>
                    <Link to="/login">Đăng nhập</Link>
                </div>
            </Card>
        </div>
    );
}

const wrapper: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    padding: 16,
};