import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('invoiceos_token'));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('invoiceos_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (data) => {
    const response = await api.post('/auth/login', data);
    localStorage.setItem('invoiceos_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user || null);
    toast.success('Logged in successfully');
    navigate('/');
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    localStorage.setItem('invoiceos_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user || null);
    toast.success('Account created successfully');
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('invoiceos_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
