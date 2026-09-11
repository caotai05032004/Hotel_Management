import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { authService, getErrorMessage, getFieldErrors } from '../../services/authService';
import type { LoginRequest } from '../../services/authService';
import { Link } from 'react-router-dom';
const { Title, Text } = Typography;

export default function Login() {
    const [form] = Form.useForm<LoginRequest>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: LoginRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.login(values);
            message.success(`Xin chào ${data.user.fullName}`);
            // TODO: điều hướng sau khi có router
            // navigate('/');
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
            <Card style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 4 }}>Đăng nhập</Title>
                    <Text type="secondary">Hệ thống quản lý khách sạn</Text>
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
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                        Đăng nhập
                    </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Chưa có tài khoản? </Text>
                    <Link to="/register">Đăng ký</Link>
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