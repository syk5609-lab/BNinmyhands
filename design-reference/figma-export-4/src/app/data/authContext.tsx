import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  joinedAt: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

export function useAuth() { return useContext(AuthContext); }

const MOCK_USERS: Record<string, User> = {
  'demo@bn.dev': { id: 'u_demo01', email: 'demo@bn.dev', displayName: 'DemoTrader', role: 'user', joinedAt: '2025-11-15T00:00:00Z' },
  'admin@bn.dev': { id: 'u_admin01', email: 'admin@bn.dev', displayName: 'AdminOps', role: 'admin', joinedAt: '2025-09-01T00:00:00Z' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, _password: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const found = MOCK_USERS[email.toLowerCase()];
    if (found) { setUser(found); setLoading(false); return true; }
    setLoading(false);
    return false;
  };

  const signup = async (email: string, displayName: string, _password: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (MOCK_USERS[email.toLowerCase()]) { setLoading(false); return false; }
    const newUser: User = { id: 'u_' + Math.random().toString(36).slice(2, 8), email, displayName, role: 'user', joinedAt: new Date().toISOString() };
    setUser(newUser);
    setLoading(false);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
