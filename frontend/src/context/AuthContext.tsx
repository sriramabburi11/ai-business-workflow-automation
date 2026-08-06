import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, orgName?: string) => Promise<void>;
  logout: () => void;
  guestLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setOrganization(res.data.organization);
        } catch (error) {
          console.error('Failed to fetch auth session:', error);
          logout();
        }
      } else {
        // Provide demo user as fallback
        setUser({
          id: 'demo-user-123',
          name: 'Sarah Connor',
          email: 'sarah.connor@enterprise.io',
          role: 'ADMIN',
          organizationId: 'demo-org-123'
        });
        setOrganization({
          id: 'demo-org-123',
          name: 'Smart Automation Enterprise'
        });
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData, organization: orgData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    if (orgData) setOrganization(orgData);
  };

  const register = async (name: string, email: string, password: string, orgName?: string) => {
    const res = await api.post('/auth/register', { name, email, password, organizationName: orgName });
    const { token: newToken, user: userData, organization: orgData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    if (orgData) setOrganization(orgData);
  };

  const guestLogin = () => {
    const demoToken = 'guest-demo-token-jwt-2026';
    localStorage.setItem('token', demoToken);
    setToken(demoToken);
    setUser({
      id: 'demo-user-123',
      name: 'Sarah Connor',
      email: 'sarah.connor@enterprise.io',
      role: 'ADMIN',
      organizationId: 'demo-org-123'
    });
    setOrganization({
      id: 'demo-org-123',
      name: 'Smart Automation Enterprise'
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        guestLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
