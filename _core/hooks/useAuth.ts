'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('evangelho_user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      } else {
        const defaultUser: User = {
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          name: 'Participante de Luz',
          email: 'visitante@egregora.org'
        };
        localStorage.setItem('evangelho_user', JSON.stringify(defaultUser));
        return defaultUser;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Already synchronized via lazy initialization, but keep a listener/sync if they want
  }, []);

  const login = (name: string, email?: string) => {
    const newUser: User = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Participante de Luz',
      email: email?.trim() || 'visitante@egregora.org'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('evangelho_user', JSON.stringify(newUser));
    }
    setUser(newUser);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('evangelho_user');
    }
    setUser(null);
  };

  const updateProfile = (name: string, email?: string) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      name: name.trim() || user.name,
      email: email?.trim() || user.email,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('evangelho_user', JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  };

  return {
    user,
    loading,
    login,
    logout,
    updateProfile,
  };
}
