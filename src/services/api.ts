/**
 * HealthWallet Nigeria - API Service
 * Handles all API calls with mode-aware behavior (production/demo/fallback)
 */

import { 
  getAppMode, 
  getApiBaseUrl, 
  logFallback, 
  logProductionError,
  shouldUseMockData 
} from '@/config/appMode';
import type { 
  User, 
  AuthResponse, 
  MedicalRecord, 
  FamilyPool, 
  Claim, 
  DrugVerification,
  ActivityItem,
  DashboardStats,
  UploadResponse,
  VerificationResponse,
  HospitalInvoice,
  AppNotification
} from '@/types';
import * as db from './localStorage';
import { 
  mockDashboardStats, 
  mockDrugDatabase,
  generateWalletAddress,
  generateTxHash,
  generateIpfsHash
} from '@/data/mockData';

// Initialize demo database
db.initializeDemoDb();

/**
 * Base fetch wrapper with mode handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  demoFn: () => T | Promise<T>
): Promise<T> {
  const mode = getAppMode();
  
  // Demo mode: always use mock data
  if (mode === 'demo' || shouldUseMockData()) {
    return demoFn();
  }
  
  const baseUrl = getApiBaseUrl();
  const token = db.getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    const err = error as Error;
    
    if (mode === 'fallback') {
      logFallback(endpoint, err);
      return demoFn();
    }
    
    logProductionError(endpoint, err);
    throw error;
  }
}

// ============================================
// Authentication APIs
// ============================================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    role: 'PATIENT' | 'HOSPITAL';
  }): Promise<AuthResponse> => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, () => {
      // Demo: Create user in localStorage
      const existingUser = db.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        walletAddress: generateWalletAddress(),
        createdAt: new Date().toISOString(),
      };
      
      db.createUser(newUser);
      const token = `demo_token_${Date.now()}`;
      db.setAuthToken(token);
      db.setCurrentUser(newUser);
      
      return {
        id: newUser.id,
        token,
        walletAddress: newUser.walletAddress,
        user: newUser,
      };
    });
  },
  
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, () => {
      // Demo: Check user exists
      const user = db.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const token = `demo_token_${Date.now()}`;
      db.setAuthToken(token);
      db.setCurrentUser(user);
      
      return {
        id: user.id,
        token,
        walletAddress: user.walletAddress,
        user,
      };
    });
  },
  
  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    return apiFetch('/auth/me', {}, () => {
      const user = db.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      return user;
    });
  },
  
  /**
   * Logout user
   */
  logout: (): void => {
    db.setAuthToken(null);
    db.setCurrentUser(null);
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!db.getAuthToken();
  },
};

// ============================================
// Medical Records APIs
// ============================================

export const recordsApi = {
  /**
   * Upload a medical record
   */
  upload: async (file: File, type: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiFetch('/records/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    }, async () => {
      // Demo: Simulate OCR and blockchain
      const user = db.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const ipfsHash = generateIpfsHash();
      const txHash = generateTxHash();
      
      const summaries: Record<string, string> = {
        PRESCRIPTION: 'Medication prescribed for treatment. Please follow dosage instructions carefully.',
        LAB_RESULT: 'Laboratory test results are within normal parameters.',
        VACCINE: 'Vaccination record successfully documented and verified.',
      };
      
      const record: MedicalRecord = {
        id: `record-${Date.now()}`,
        userId: user.id,
        type: type as MedicalRecord['type'],
        title: file.name.replace(/\.[^/.]+$/, ''),
        summary: summaries[type] || 'Medical record uploaded successfully.',
        ipfsHash,
        txHash,
        hospitalName: 'Lagos General Hospital',
        fileUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      
      db.createRecord(record);
      
      // Add activity
      db.addActivity({
        id: `activity-${Date.now()}`,
        type: 'record',
        title: 'Medical Record Added',
        description: `${record.title} uploaded and verified on blockchain`,
        timestamp: new Date().toISOString(),
        status: 'success',
        txHash,
      });
      
      return {
        id: record.id,
        aiSummary: record.summary,
        ipfsHash,
        txHash,
      };
    });
  },
  
  /**
   * Get all records
   */
  getAll: async (limit?: number): Promise<MedicalRecord[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiFetch(`/records${params}`, {}, () => {
      const user = db.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const records = db.getRecords(user.id);
      return limit ? records.slice(0, limit) : records;
    });
  },
  
  /**
   * Get record by ID
   */
  getById: async (id: string): Promise<MedicalRecord> => {
    return apiFetch(`/records/${id}`, {}, () => {
      const record = db.getRecordById(id);
      if (!record) throw new Error('Record not found');
      return record;
    });
  },
  
  /**
   * Verify record on-chain
   */
  verify: async (id: string): Promise<VerificationResponse> => {
    return apiFetch(`/records/${id}/verify`, {}, () => {
      const record = db.getRecordById(id);
      if (!record) throw new Error('Record not found');
      
      return {
        verified: true,
        onChainHash: record.ipfsHash,
        timestamp: new Date(record.createdAt).getTime(),
      };
    });
  },
};

// ============================================
// Family Fund APIs
// ============================================

export const familyApi = {
  /**
   * Create a family pool
   */
  create: async (data: { name: string; monthlyContribution: number }): Promise<FamilyPool> => {
    return apiFetch('/family/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }, () => {
      const user = db.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const pool: FamilyPool = {
        id: `pool-${Date.now()}`,
        name: data.name,
        contractAddress: generateWalletAddress(),
        totalBalance: 0,
        monthlyContribution: data.monthlyContribution,
        members: [{
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          walletAddress: user.walletAddress,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        }],
        claims: [],
        createdAt: new Date().toISOString(),
      };
      
      db.createFamilyPool(pool);
      return pool;
    });
  },
  
  /**
   * Get family pool
   */
  getPool: async (): Promise<FamilyPool | null> => {
    return apiFetch('/family/pool', {}, () => {
      return db.getFamilyPool();
    });
  },
  
  /**
   * Fund wallet
   */
  fund: async (data: { amount: number; currency: 'NGN' | 'USD' }): Promise<{ success: boolean; txHash: string }> => {
    return apiFetch('/family/fund', {
      method: 'POST',
      body: JSON.stringify(data),
    }, () => {
      const pool = db.getFamilyPool();
      if (!pool) throw new Error('No family pool found');
      
      pool.totalBalance += data.amount;
      db.updateFamilyPool(pool);
      
      const txHash = generateTxHash();
      
      db.addActivity({
        id: `activity-${Date.now()}`,
        type: 'contribution',
        title: 'Wallet Funded',
        description: `₦${data.amount.toLocaleString()} added to ${pool.name}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        txHash,
      });
      
      return { success: true, txHash };
    });
  },
  
  /**
   * Submit a claim
   */
  submitClaim: async (data: {
    amount: number;
    reason: string;
    hospitalWallet?: string;
  }): Promise<Claim> => {
    return apiFetch('/family/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    }, () => {
      const user = db.getCurrentUser();
      const pool = db.getFamilyPool();
      if (!user) throw new Error('Not authenticated');
      if (!pool) throw new Error('No family pool found');
      
      const claim: Claim = {
        id: `claim-${Date.now()}`,
        poolId: pool.id,
        amount: data.amount,
        reason: data.reason,
        status: 'PENDING',
        votesFor: 0,
        votesAgainst: 0,
        requesterName: user.fullName,
        hospitalWallet: data.hospitalWallet,
        createdAt: new Date().toISOString(),
      };
      
      db.createClaim(claim);
      
      db.addNotification({
        id: `notif-${Date.now()}`,
        title: 'New Claim Submitted',
        message: `${user.fullName} submitted a claim for ₦${data.amount.toLocaleString()}`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      return claim;
    });
  },
  
  /**
   * Get claims
   */
  getClaims: async (): Promise<Claim[]> => {
    return apiFetch('/family/claims', {}, () => {
      const pool = db.getFamilyPool();
      if (!pool) return [];
      return db.getClaims(pool.id);
    });
  },
  
  /**
   * Vote on a claim
   */
  vote: async (claimId: string, decision: boolean): Promise<Claim> => {
    return apiFetch(`/family/claims/${claimId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }, () => {
      const claim = db.getClaimById(claimId);
      if (!claim) throw new Error('Claim not found');
      
      const updates: Partial<Claim> = decision
        ? { votesFor: claim.votesFor + 1 }
        : { votesAgainst: claim.votesAgainst + 1 };
      
      // Auto-approve if enough votes
      const pool = db.getFamilyPool();
      if (pool && updates.votesFor && updates.votesFor >= Math.ceil(pool.members.length / 2)) {
        updates.status = 'APPROVED';
        updates.txHash = generateTxHash();
      }
      
      const updated = db.updateClaim(claimId, updates);
      if (!updated) throw new Error('Failed to update claim');
      
      db.addActivity({
        id: `activity-${Date.now()}`,
        type: 'vote',
        title: 'Vote Cast',
        description: `You voted to ${decision ? 'approve' : 'reject'} a claim for ₦${claim.amount.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
      
      return updated;
    });
  },
};

// ============================================
// Drug Verification APIs
// ============================================

export const drugsApi = {
  /**
   * Verify a drug by NAFDAC number
   */
  verify: async (nafdacNumber: string): Promise<DrugVerification> => {
    return apiFetch(`/drugs/verify/${nafdacNumber}`, {}, () => {
      const drug = mockDrugDatabase[nafdacNumber.toUpperCase()];
      
      if (drug) {
        db.addActivity({
          id: `activity-${Date.now()}`,
          type: 'verification',
          title: 'Drug Verified',
          description: `NAFDAC verification for ${drug.drugName || nafdacNumber} - ${drug.status}`,
          timestamp: new Date().toISOString(),
          status: drug.status === 'VERIFIED' ? 'success' : 'failed',
        });
        
        return drug;
      }
      
      return {
        status: 'NOT_FOUND',
        nafdacNumber,
      };
    });
  },
};

// ============================================
// Dashboard APIs
// ============================================

export const dashboardApi = {
  /**
   * Get dashboard stats
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiFetch('/dashboard/stats', {}, () => {
      const user = db.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const records = db.getRecords(user.id);
      const pool = db.getFamilyPool();
      const claims = pool ? db.getClaims(pool.id) : [];
      
      return {
        totalRecords: records.length,
        poolBalance: pool?.totalBalance || 0,
        pendingClaims: claims.filter(c => c.status === 'PENDING').length,
        verifiedDrugs: mockDashboardStats.verifiedDrugs,
      };
    });
  },
  
  /**
   * Get recent activities
   */
  getActivities: async (limit = 5): Promise<ActivityItem[]> => {
    return apiFetch(`/dashboard/activities?limit=${limit}`, {}, () => {
      return db.getActivities(limit);
    });
  },
};

// ============================================
// Hospital APIs
// ============================================

export const hospitalApi = {
  /**
   * Submit an invoice
   */
  submitInvoice: async (data: {
    patientWallet: string;
    diagnosis: string;
    cost: number;
    treatmentPlan: string;
  }): Promise<HospitalInvoice> => {
    return apiFetch('/hospital/invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    }, () => {
      const user = db.getCurrentUser();
      if (!user || user.role !== 'HOSPITAL') throw new Error('Not authorized');
      
      const invoice: HospitalInvoice = {
        id: `invoice-${Date.now()}`,
        patientWallet: data.patientWallet,
        hospitalWallet: user.walletAddress,
        diagnosis: data.diagnosis,
        cost: data.cost,
        treatmentPlan: data.treatmentPlan,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      db.createInvoice(invoice);
      return invoice;
    });
  },
  
  /**
   * Get invoices
   */
  getInvoices: async (): Promise<HospitalInvoice[]> => {
    return apiFetch('/hospital/invoices', {}, () => {
      return db.getInvoices();
    });
  },
};

// ============================================
// Notifications APIs
// ============================================

export const notificationsApi = {
  /**
   * Get all notifications
   */
  getAll: async (): Promise<AppNotification[]> => {
    return apiFetch('/notifications', {}, () => {
      return db.getNotifications();
    });
  },
  
  /**
   * Mark notification as read
   */
  markRead: async (id: string): Promise<void> => {
    return apiFetch(`/notifications/${id}/read`, {
      method: 'POST',
    }, () => {
      db.markNotificationRead(id);
    });
  },
};
