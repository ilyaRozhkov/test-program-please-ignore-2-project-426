import React from 'react';
import { NavLink, useNavigate  } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './component_style.css'

export const Navbar: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

 const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    backgroundColor: isActive ? '#3E9BFF' : 'inherit',
    color: isActive ? 'white' : 'black',
  });

  return (
    <nav className={'navigation-container'}>
      <NavLink to="/" className={'navigation-button' } style={linkStyle}>Главная</NavLink>
      <NavLink to="/catalog" data-testid="nav-catalog" className={'navigation-button'} style={linkStyle}>Каталог</NavLink>
      <NavLink to="/cart" data-testid="nav-cart" className={'navigation-button'}  style={linkStyle}>
        Корзина {totalItems > 0 && <span>({totalItems})</span>}
      </NavLink>
      {!isAuthenticated ? (
        <>
          <NavLink to="/register" data-testid="nav-signup" className={'navigation-button'}  style={linkStyle}>Регистрация</NavLink>
          <NavLink to="/login" data-testid="nav-signin" className={'navigation-button'}  style={linkStyle}>Вход</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/account" data-testid="nav-account" className={'navigation-button'}  style={linkStyle}>Личный кабинет</NavLink>
          <button onClick={handleLogout} data-testid="nav-signout" className={'navigation-button'} >Выйти</button>
        </>
      )}
    </nav>
  );
};