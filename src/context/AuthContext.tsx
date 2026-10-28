import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { BRAND_CONFIG } from '../config/branding';
import { AdminUser } from '../types';

export interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
  updateProfile: (updates: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = 'forgepro_admin_verified_session';

interface RegisteredAdminAccount extends AdminUser {
  password: string;
}

// Daftar akun admin terdaftar yang valid di ForgePro.id
const REGISTERED_ADMINS: RegisteredAdminAccount[] = [
  {
    email: 'admin@forgepro.id',
    password: 'admin123',
    name: BRAND_CONFIG.defaultAdmin.name,
    role: BRAND_CONFIG.defaultAdmin.role,
    avatarInitial: BRAND_CONFIG.defaultAdmin.avatarInitial,
  },
  {
    email: 'andi@forgepro.id',
    password: 'admin123',
    name: 'Andi Prasetyo',
    role: 'Admin Utama',
    avatarInitial: 'A',
  },
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      // Hapus sesi lama di localStorage agar tidak otomatis masuk tanpa login
      localStorage.removeItem('forgepro_admin_session');
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as AdminUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem('forgepro_admin_session');
  }, []);

  /**
   * Autentikasi login admin ForgePro.id
   * Hanya mengizinkan masuk jika email & password sesuai dengan akun terdaftar
   */
  const login = async (email: string, password: string): Promise<AdminUser> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const rawPassword = password || '';

        if (!normalizedEmail || !normalizedEmail.includes('@')) {
          const err = 'Masukkan alamat email yang valid.';
          setError(err);
          setIsLoading(false);
          reject(new Error(err));
          return;
        }

        if (!rawPassword) {
          const err = 'Password wajib diisi.';
          setError(err);
          setIsLoading(false);
          reject(new Error(err));
          return;
        }

        // Cek kecocokan email dan password secara ketat
        const matchedAccount = REGISTERED_ADMINS.find(
          (acc) =>
            acc.email.toLowerCase() === normalizedEmail &&
            acc.password === rawPassword
        );

        if (!matchedAccount) {
          const err =
            'Email atau password tidak sesuai. Anda tidak dapat mengakses halaman admin.';
          setError(err);
          setIsLoading(false);
          reject(new Error(err));
          return;
        }

        const authData: AdminUser = {
          name: matchedAccount.name,
          email: matchedAccount.email,
          role: matchedAccount.role,
          avatarInitial: matchedAccount.avatarInitial,
          loggedInAt: new Date().toISOString(),
        };

        setUser(authData);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(authData));
        setIsLoading(false);
        resolve(authData);
      }, 600);
    });
  };

  /**
   * Perbarui data profil admin yang sedang login
   */
  const updateProfile = (updates: Partial<AdminUser>): void => {
    setUser((prev) => {
      const base = prev || BRAND_CONFIG.defaultAdmin;
      const updated: AdminUser = {
        ...base,
        ...updates,
        avatarInitial: (updates.name || base.name || 'A')
          .charAt(0)
          .toUpperCase(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Logout dan hapus sesi aktif
   */
  const logout = (): void => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('forgepro_admin_session');
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        setError,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
