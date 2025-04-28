import React, { useState, useEffect } from 'react';
import './LoginPopup.css';
import { useAuth } from '../../hooks/useAuth';

/**
 * 登录弹窗组件
 * 处理用户登录和自动注册功能
 */
const LoginPopup = ({ isOpen, onClose }) => {
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  // 错误状态
  const [errors, setErrors] = useState({});
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 当前模式：login 或 register
  const [mode, setMode] = useState('login');

  // 使用认证钩子
  const { login, register, isAuthenticated } = useAuth();

  // 监听认证状态变化，已登录则关闭弹窗
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位';
    }

    // 如果是注册模式，验证邮箱
    if (mode === 'register') {
      if (!formData.email) {
        newErrors.email = '邮箱不能为空';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await login(formData.username, formData.password);

        // 如果用户不存在，自动切换到注册模式
        if (result?.error === 'user_not_found') {
          setMode('register');
          setErrors({ general: '用户不存在，请注册' });
          return;
        }
      } else {
        await register(formData.username, formData.password, formData.email);
      }
    } catch (error) {
      setErrors({ general: error.message || '操作失败，请稍后再试' });
    } finally {
      setIsLoading(false);
    }
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  // 如果弹窗未打开，不渲染
  if (!isOpen) return null;

  return (
    <div className="login-popup-overlay">
      <div className="login-popup-container">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? '登录' : '注册'}</h2>

        {errors.general && <p className="error-message">{errors.general}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <p className="mode-toggle">
          {mode === 'login' ? '没有账号？' : '已有账号？'}
          <button
            type="button"
            onClick={toggleMode}
            className="toggle-button"
            disabled={isLoading}
          >
            {mode === 'login' ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;

