import { useState, useEffect } from 'react';

interface AuthUser {
  userId: number;
  username: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    }
  }, []);

  const isAuthenticated = !!localStorage.getItem('token');

  return { user, isAuthenticated };
};