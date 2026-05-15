import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { orderService } from './order.service';

interface User {
  userId: number;
  username: string;
  role: string;
  employeeId?: number | null;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  orderCount: number;
  fetchOrderCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchOrderCount = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await orderService.getMyOrders({ page: 0, size: 100 }); 
        const activeOrders = response.data.content.filter((order: any) => order.status !== 'CANCELLED');
        setOrderCount(activeOrders.length);
      } catch (error) {
        console.error("Không thể tải số lượng đơn hàng:", error);
        setOrderCount(0);
      }
    } else {
      setOrderCount(0);
    }
  };

  useEffect(() => {
    fetchOrderCount();
  }, [isAuthenticated]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setOrderCount(0);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, orderCount, fetchOrderCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};