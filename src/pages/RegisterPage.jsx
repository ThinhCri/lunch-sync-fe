import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockHandlers } from '@/api/mock';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Optimistic redirect
      navigate('/create');

      const res = await mockHandlers.register(values.email, values.password);
      if (res.error) {
        message.error(res.error.message || 'Đăng ký thất bại');
        navigate('/register');
        return;
      }
      login(res.token, res.user);
    } catch (err) {
      message.error(err.message || 'Đăng ký thất bại');
      navigate('/register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>Đăng ký</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.formWrap}>
        <div className={styles.logoSection}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#6C63FF"/>
            <path d="M32 18c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 4c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" fill="white"/>
            <path d="M32 24v8l5.657 5.657" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="3" fill="white"/>
          </svg>
          <h1 className={styles.title}>Tạo tài khoản</h1>
          <p className={styles.subtitle}>Tham gia cùng LunchSync ngay hôm nay</p>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.form}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              size="large"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className={styles.submitBtn}
          >
            Đăng ký
          </Button>
        </Form>

        <p className={styles.loginLink}>
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
