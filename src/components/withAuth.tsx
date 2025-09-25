'use client';

import { useState, useEffect, ComponentType } from 'react';

const PASSWORD = '123';
const AUTH_KEY = 'isAdminAuthenticated';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Новое состояние для проверки
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
      // Проверяем localStorage только на клиенте
      const hasAccess = localStorage.getItem(AUTH_KEY) === 'true';
      if (hasAccess) {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false); // Завершаем проверку
    }, []);

    const handleLogin = () => {
      if (password === PASSWORD) {
        localStorage.setItem(AUTH_KEY, 'true');
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Неверный пароль');
      }
    };

    if (isCheckingAuth) {
      return null; // Или можно вернуть компонент-загрузчик
    }

    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Вход в панель администратора</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            style={{ padding: '8px', marginRight: '1rem' }}
          />
          <button onClick={handleLogin}>Войти</button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>
      </div>
    );
  };

  return WithAuthComponent;
};

export default withAuth;
