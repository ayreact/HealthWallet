/**
 * HealthWallet Nigeria - LocalStorage Service
 * Simulates a database for demo mode
 */

import type { 
  User, 
  MedicalRecord, 
  FamilyPool, 
  Claim, 
  ActivityItem,
  AppNotification,
  HospitalInvoice 
} from '@/types';
import { 
  mockUsers, 
  mockMedicalRecords, 
  mockFamilyPool, 
  mockClaims,
  mockActivityItems,
  mockNotifications,
  mockHospitalInvoices
} from '@/data/mockData';

const STORAGE_KEYS = {
  USERS: 'healthwallet_users',
  CURRENT_USER: 'healthwallet_current_user',
  AUTH_TOKEN: 'healthwallet_token',
  RECORDS: 'healthwallet_records',
  FAMILY_POOL: 'healthwallet_family_pool',
  CLAIMS: 'healthwallet_claims',
  ACTIVITIES: 'healthwallet_activities',
  NOTIFICATIONS: 'healthwallet_notifications',
  INVOICES: 'healthwallet_invoices',
  INITIALIZED: 'healthwallet_initialized'
};

/**
 * Initialize the demo database with mock data
 */
export const initializeDemoDb = (): void => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(mockMedicalRecords));
    localStorage.setItem(STORAGE_KEYS.FAMILY_POOL, JSON.stringify(mockFamilyPool));
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(mockClaims));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivityItems));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(mockHospitalInvoices));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    console.log('[HealthWallet Demo] Database initialized with mock data');
  }
};

/**
 * Reset the demo database
 */
export const resetDemoDb = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeDemoDb();
  console.log('[HealthWallet Demo] Database reset');
};

// Generic helpers
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// User Operations
export const getUsers = (): User[] => getItem(STORAGE_KEYS.USERS, mockUsers);

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const createUser = (user: User): User => {
  const users = getUsers();
  users.push(user);
  setItem(STORAGE_KEYS.USERS, users);
  return user;
};

export const getCurrentUser = (): User | null => {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

// Medical Records Operations
export const getRecords = (userId?: string): MedicalRecord[] => {
  const records = getItem(STORAGE_KEYS.RECORDS, mockMedicalRecords);
  return userId ? records.filter(r => r.userId === userId) : records;
};

export const getRecordById = (id: string): MedicalRecord | undefined => {
  const records = getRecords();
  return records.find(r => r.id === id);
};

export const createRecord = (record: MedicalRecord): MedicalRecord => {
  const records = getRecords();
  records.unshift(record);
  setItem(STORAGE_KEYS.RECORDS, records);
  return record;
};

// Family Pool Operations
export const getFamilyPool = (poolId?: string): FamilyPool | null => {
  const pool = getItem<FamilyPool | null>(STORAGE_KEYS.FAMILY_POOL, mockFamilyPool);
  if (poolId && pool && pool.id !== poolId) return null;
  return pool;
};

export const updateFamilyPool = (pool: FamilyPool): FamilyPool => {
  setItem(STORAGE_KEYS.FAMILY_POOL, pool);
  return pool;
};

export const createFamilyPool = (pool: FamilyPool): FamilyPool => {
  setItem(STORAGE_KEYS.FAMILY_POOL, pool);
  return pool;
};

// Claims Operations
export const getClaims = (poolId?: string): Claim[] => {
  const claims = getItem(STORAGE_KEYS.CLAIMS, mockClaims);
  return poolId ? claims.filter(c => c.poolId === poolId) : claims;
};

export const getClaimById = (id: string): Claim | undefined => {
  const claims = getClaims();
  return claims.find(c => c.id === id);
};

export const createClaim = (claim: Claim): Claim => {
  const claims = getClaims();
  claims.unshift(claim);
  setItem(STORAGE_KEYS.CLAIMS, claims);
  return claim;
};

export const updateClaim = (id: string, updates: Partial<Claim>): Claim | null => {
  const claims = getClaims();
  const index = claims.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  claims[index] = { ...claims[index], ...updates };
  setItem(STORAGE_KEYS.CLAIMS, claims);
  return claims[index];
};

// Activity Operations
export const getActivities = (limit?: number): ActivityItem[] => {
  const activities = getItem(STORAGE_KEYS.ACTIVITIES, mockActivityItems);
  return limit ? activities.slice(0, limit) : activities;
};

export const addActivity = (activity: ActivityItem): ActivityItem => {
  const activities = getActivities();
  activities.unshift(activity);
  setItem(STORAGE_KEYS.ACTIVITIES, activities);
  return activity;
};

// Notification Operations
export const getNotifications = (): AppNotification[] => {
  return getItem(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
};

export const markNotificationRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

export const addNotification = (notification: AppNotification): AppNotification => {
  const notifications = getNotifications();
  notifications.unshift(notification);
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return notification;
};

// Invoice Operations
export const getInvoices = (): HospitalInvoice[] => {
  return getItem(STORAGE_KEYS.INVOICES, mockHospitalInvoices);
};

export const createInvoice = (invoice: HospitalInvoice): HospitalInvoice => {
  const invoices = getInvoices();
  invoices.unshift(invoice);
  setItem(STORAGE_KEYS.INVOICES, invoices);
  return invoice;
};
