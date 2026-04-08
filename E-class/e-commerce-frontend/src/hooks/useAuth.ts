// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  userId: number;
  username: string;
  email: string;
  // Thêm các trường thông tin người dùng nếu cần
}

const useAuth = (): { user: User | null } => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (loggedUser?.userId) {
      setUser(loggedUser);  // Nếu có người dùng, lưu vào state
    }
  }, []);

  return { user };
};

export default useAuth;