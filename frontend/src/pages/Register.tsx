import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { RegisterRequest } from '../api/types';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data: RegisterRequest = { email, password };
      await register(data);

      const { token, user } = await login({ email, password });
      authLogin(token, user);

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className='login-page-container'>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} className='login-page-form'>
        <div className='input-field'>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} data-testid="auth-email" placeholder='Введите email' required style={{width: '92%'}}/>
        </div>
        <div className='input-field'>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} data-testid="auth-password" placeholder='Введите пароль' required style={{width: '92%'}} />
        </div>
        {error && <div data-testid="auth-error">{error}</div>}
        <button type="submit" data-testid="auth-submit" className='login-btn'>Зарегистрироваться</button>
      </form>
    </div>
  );
};
