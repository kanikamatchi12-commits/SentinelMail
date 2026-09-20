import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AnalystUser {
  id: string;
  name: string;
  role: string;
  clearance: string;
  badgeId: string;
  isJudgeMode: boolean;
}

interface AuthContextType {
  user: AnalystUser | null;
  login: (user: AnalystUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_ANALYST: AnalystUser = {
  id: 'analyst-01',
  name: 'Analyst R. Sharma',
  role: 'SOC Tier-2 Threat Hunter',
  clearance: 'Level 4 Forensics',
  badgeId: 'SIH-IND-2024-88',
  isJudgeMode: true,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_ANALYST,
  login: () => {},
  logout: () => {},
  isAuthenticated: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnalystUser | null>(() => {
    try {
      const saved = localStorage.getItem('sentinelmail_analyst');
      if (saved) return JSON.parse(saved);
      // Auto default to logged in as demo analyst for smooth immediate preview
      return DEFAULT_ANALYST;
    } catch {
      return DEFAULT_ANALYST;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('sentinelmail_analyst', JSON.stringify(user));
      } else {
        localStorage.removeItem('sentinelmail_analyst');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = (newUser: AnalystUser) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
