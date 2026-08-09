import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/client';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ email, password });
      navigate('/login', { state: { message: 'Регистрация успешна, войдите' } });
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
        <button type="submit" data-testid="auth-submit" className='login-btn'>Войти</button>
      </form>
    </div>
  );
};