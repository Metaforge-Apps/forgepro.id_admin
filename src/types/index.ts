export type ThemeMode = 'dark' | 'light';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  loggedInAt?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface BrandConfig {
  appName: string;
  appNamePrefix: string;
  appNameSuffix: string;
  tagline: string;
  description: string;
  version: string;
  logos: {
    horizontal: string;
    badge: string;
    loginHero: string;
  };
  defaultAdmin: AdminUser;
  defaultTheme: ThemeMode;
  dashboard: {
    categoryLabel: string;
    title: string;
    subtitle: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    submitLoading: string;
  };
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin Utama' | 'Operasional' | 'Produk' | 'Keuangan';
  access: string;
  status: 'Aktif' | 'Diundang' | 'Nonaktif';
  lastActive: string;
  actionLabel: string;
}

export type ActivityCategory =
  | 'Pesanan'
  | 'Katalog'
  | 'Paket'
  | 'Voucher'
  | 'Admin'
  | 'Pengaturan'
  | 'Sistem';

export interface ActivityLogItem {
  id: string;
  time: string;
  source: string;
  category: ActivityCategory;
  activity: string;
  result: string;
}

export interface WebhookItem {
  id: string;
  time: string;
  eventTitle: string;
  eventSub: string;
  statusBadge: string;
  statusType: 'success' | 'error';
  latency: string;
  attempts: string;
  actionLabel: string;
}

export * from '../controllers/style-controller/style.types';
export * from '../controllers/package-controller/package.types';
export * from '../controllers/voucher-controller/voucher.types';
export * from '../controllers/order-controller/order.types';
