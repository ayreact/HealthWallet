/**
 * HealthWallet Nigeria - Type Definitions
 * Based on the TRD specification
 */

// User Roles
export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN';

// Claim Status
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

// Record Types
export type RecordType = 'PRESCRIPTION' | 'LAB_RESULT' | 'VACCINE';

// Drug Verification Status
export type DrugStatus = 'VERIFIED' | 'COUNTERFEIT' | 'NOT_FOUND';

// User Model
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  walletAddress: string;
  familyPoolId?: string;
  createdAt: string;
  avatar?: string;
  // QR Identity
  qrToken?: string;
  isQrEnabled?: boolean;
}

// Auth Response
export interface AuthResponse {
  id: string;
  token: string;
  walletAddress: string;
  user: User;
}

// Medical Record
export interface MedicalRecord {
  id: string;
  userId: string;
  type: RecordType;
  title: string;
  summary: string;
  ipfsHash: string;
  txHash: string;
  hospitalName?: string;
  fileUrl: string;
  verified?: boolean;
  createdAt: string;
}

// Family Pool
export interface FamilyPool {
  id: string;
  name: string;
  contractAddress: string;
  totalBalance: number;
  monthlyContribution: number;
  members: FamilyMember[];
  claims: Claim[];
  createdAt: string;
}

// Family Member
export interface FamilyMember {
  id: string;
  fullName: string;
  email: string;
  walletAddress: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

// Claim
export interface Claim {
  id: string;
  poolId: string;
  amount: number;
  reason: string;
  status: ClaimStatus;
  votesFor: number;
  votesAgainst: number;
  txHash?: string;
  requesterName: string;
  hospitalWallet?: string;
  createdAt: string;
}

// Drug Verification Result
export interface DrugVerification {
  status: DrugStatus;
  nafdacNumber: string;
  drugName?: string;
  manufacturer?: string;
  expiryDate?: string;
  batchNumber?: string;
}

// Activity Item for Dashboard
export interface ActivityItem {
  id: string;
  type: 'record' | 'claim' | 'contribution' | 'vote' | 'verification';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
  txHash?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload Response
export interface UploadResponse {
  id: string;
  aiSummary: string;
  ipfsHash: string;
  txHash: string;
}

// Verification Response
export interface VerificationResponse {
  verified: boolean;
  onChainHash: string;
  timestamp: number;
}

// Fund Wallet Request
export interface FundWalletRequest {
  amount: number;
  currency: 'NGN' | 'USD';
}

// Hospital Invoice
export interface HospitalInvoice {
  id: string;
  patientWallet: string;
  hospitalWallet: string;
  diagnosis: string;
  cost: number;
  treatmentPlan: string;
  status: 'pending' | 'submitted' | 'paid';
  createdAt: string;
}

// Stats for Dashboard
export interface DashboardStats {
  totalRecords: number;
  poolBalance: number;
  pendingClaims: number;
  verifiedDrugs: number;
}

// App Notification (renamed to avoid conflict with browser Notification)
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
