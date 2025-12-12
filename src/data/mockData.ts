import type { 
  User, 
  MedicalRecord, 
  FamilyPool, 
  Claim, 
  ActivityItem,
  DrugVerification,
  AppNotification,
  DashboardStats 
} from '@/types';

// Generate a fake wallet address
export const generateWalletAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Generate a fake transaction hash
export const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generate a fake IPFS hash
export const generateIpfsHash = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = 'Qm';
  for (let i = 0; i < 44; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'chioma@example.com',
    fullName: 'Chioma Adeyemi',
    phoneNumber: '+234 801 234 5678',
    role: 'PATIENT',
    walletAddress: '0x745a0d1c99dcc7c1016de17847db76b5852aacd6',
    familyPoolId: 'pool-1',
    createdAt: '2024-01-15T10:00:00Z',
    avatar: undefined
  },
  {
    id: 'user-2',
    email: 'emeka@hospital.ng',
    fullName: 'Dr. Emeka Okonkwo',
    phoneNumber: '+234 802 345 6789',
    role: 'DOCTOR',
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    createdAt: '2024-01-10T09:00:00Z',
    avatar: undefined
  },
  {
    id: 'user-3',
    email: 'lagos@hospital.ng',
    fullName: 'Lagos General Hospital',
    phoneNumber: '+234 803 456 7890',
    role: 'HOSPITAL',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    createdAt: '2024-01-05T08:00:00Z',
    avatar: undefined
  }
];

// Mock Medical Records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'record-1',
    userId: 'user-1',
    type: 'PRESCRIPTION',
    title: 'Malaria Treatment',
    summary: 'Coartem 80/480mg - Take 4 tablets twice daily for 3 days. Diagnosed with Plasmodium falciparum malaria.',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    hospitalName: 'Lagos General Hospital',
    fileUrl: 'https://gateway.pinata.cloud/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    verified: true,
    createdAt: '2024-03-15T14:30:00Z'
  },
  {
    id: 'record-2',
    userId: 'user-1',
    type: 'LAB_RESULT',
    title: 'Blood Test Results',
    summary: 'Complete Blood Count (CBC) - All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 6,500/µL',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    hospitalName: 'Reddington Hospital',
    fileUrl: 'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    verified: true,
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 'record-3',
    userId: 'user-1',
    type: 'VACCINE',
    title: 'COVID-19 Vaccination',
    summary: 'Pfizer-BioNTech COVID-19 Vaccine - Second dose administered. Full vaccination complete.',
    ipfsHash: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
    txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    hospitalName: 'Federal Medical Centre',
    fileUrl: 'https://gateway.pinata.cloud/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
    verified: true,
    createdAt: '2024-02-20T11:00:00Z'
  },
  {
    id: 'record-4',
    userId: 'user-1',
    type: 'PRESCRIPTION',
    title: 'Hypertension Medication',
    summary: 'Amlodipine 5mg - Take once daily in the morning. Blood pressure: 150/95 mmHg at diagnosis.',
    ipfsHash: 'QmWGQhWaLePn6yB6VmAJ1JUqZr7A6Krc2QbxpGPzR1Pmjx',
    txHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    hospitalName: 'St. Nicholas Hospital',
    fileUrl: 'https://gateway.pinata.cloud/ipfs/QmWGQhWaLePn6yB6VmAJ1JUqZr7A6Krc2QbxpGPzR1Pmjx',
    verified: true,
    createdAt: '2024-01-25T16:45:00Z'
  }
];

// Mock Family Pool
export const mockFamilyPool: FamilyPool = {
  id: 'pool-1',
  name: 'Okafor Family Fund',
  contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
  totalBalance: 250000,
  monthlyContribution: 5000,
  members: [
    {
      id: 'user-1',
      fullName: 'Chioma Adeyemi',
      email: 'chioma@example.com',
      walletAddress: '0x745a0d1c99dcc7c1016de17847db76b5852aacd6',
      role: 'admin',
      joinedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'member-2',
      fullName: 'Chukwuemeka Okafor',
      email: 'emeka.okafor@example.com',
      walletAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      role: 'member',
      joinedAt: '2024-01-16T12:00:00Z'
    },
    {
      id: 'member-3',
      fullName: 'Ngozi Okafor',
      email: 'ngozi@example.com',
      walletAddress: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      role: 'member',
      joinedAt: '2024-01-18T14:00:00Z'
    },
    {
      id: 'member-4',
      fullName: 'Obinna Adeyemi',
      email: 'obinna@example.com',
      walletAddress: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      role: 'member',
      joinedAt: '2024-01-20T09:00:00Z'
    }
  ],
  claims: [],
  createdAt: '2024-01-15T10:00:00Z'
};

// Mock Claims
export const mockClaims: Claim[] = [
  {
    id: 'claim-1',
    poolId: 'pool-1',
    amount: 45000,
    reason: 'Malaria Treatment - Hospital admission and medication',
    status: 'APPROVED',
    votesFor: 3,
    votesAgainst: 0,
    txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
    requesterName: 'Chioma Adeyemi',
    hospitalWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    createdAt: '2024-03-14T10:00:00Z'
  },
  {
    id: 'claim-2',
    poolId: 'pool-1',
    amount: 25000,
    reason: 'Dental Surgery - Wisdom tooth extraction',
    status: 'PENDING',
    votesFor: 1,
    votesAgainst: 0,
    requesterName: 'Ngozi Okafor',
    hospitalWallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    createdAt: '2024-03-18T15:30:00Z'
  },
  {
    id: 'claim-3',
    poolId: 'pool-1',
    amount: 75000,
    reason: 'Emergency Surgery - Appendectomy',
    status: 'PAID',
    votesFor: 4,
    votesAgainst: 0,
    txHash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890def',
    requesterName: 'Obinna Adeyemi',
    hospitalWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    createdAt: '2024-02-28T08:00:00Z'
  }
];

// Mock Activity Items
export const mockActivityItems: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'record',
    title: 'Medical Record Added',
    description: 'Malaria Treatment prescription uploaded and verified on blockchain',
    timestamp: '2024-03-15T14:30:00Z',
    status: 'success',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'activity-2',
    type: 'claim',
    title: 'Claim Approved',
    description: 'Your claim for ₦45,000 was approved by the family pool',
    timestamp: '2024-03-14T16:00:00Z',
    status: 'success'
  },
  {
    id: 'activity-3',
    type: 'contribution',
    title: 'Monthly Contribution',
    description: 'Automatic contribution of ₦5,000 to Okafor Family Fund',
    timestamp: '2024-03-01T00:00:00Z',
    status: 'success',
    txHash: '0xfed1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc'
  },
  {
    id: 'activity-4',
    type: 'vote',
    title: 'Vote Cast',
    description: 'You voted to approve Ngozi\'s dental surgery claim',
    timestamp: '2024-03-18T16:00:00Z',
    status: 'pending'
  },
  {
    id: 'activity-5',
    type: 'verification',
    title: 'Drug Verified',
    description: 'NAFDAC verification for Coartem 80/480mg - Authentic',
    timestamp: '2024-03-15T14:35:00Z',
    status: 'success'
  }
];

// Mock Drug Verifications
export const mockDrugDatabase: Record<string, DrugVerification> = {
  'A4-1394': {
    status: 'VERIFIED',
    nafdacNumber: 'A4-1394',
    drugName: 'Coartem 80/480mg',
    manufacturer: 'Novartis Pharma',
    expiryDate: '2025-12-31',
    batchNumber: 'COA2024001'
  },
  'B1-5678': {
    status: 'VERIFIED',
    nafdacNumber: 'B1-5678',
    drugName: 'Amoxicillin 500mg',
    manufacturer: 'Emzor Pharmaceuticals',
    expiryDate: '2025-06-30',
    batchNumber: 'AMX2024002'
  },
  'C2-9012': {
    status: 'VERIFIED',
    nafdacNumber: 'C2-9012',
    drugName: 'Paracetamol 500mg',
    manufacturer: 'GlaxoSmithKline',
    expiryDate: '2026-03-15',
    batchNumber: 'PCM2024003'
  },
  'FAKE-001': {
    status: 'COUNTERFEIT',
    nafdacNumber: 'FAKE-001',
    drugName: undefined,
    manufacturer: undefined
  }
};

// Mock Notifications
export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Claim Approved',
    message: 'Your claim for ₦45,000 has been approved by the family pool.',
    type: 'success',
    read: false,
    createdAt: '2024-03-14T16:00:00Z'
  },
  {
    id: 'notif-2',
    title: 'New Claim Pending',
    message: 'Ngozi Okafor submitted a claim for ₦25,000. Please vote.',
    type: 'info',
    read: false,
    createdAt: '2024-03-18T15:30:00Z'
  },
  {
    id: 'notif-3',
    title: 'Record Verified',
    message: 'Your medical record has been successfully verified on the blockchain.',
    type: 'success',
    read: true,
    createdAt: '2024-03-15T14:30:00Z'
  }
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalRecords: 4,
  poolBalance: 250000,
  pendingClaims: 1,
  verifiedDrugs: 12
};

// Hospital Invoices
export const mockHospitalInvoices = [
  {
    id: 'invoice-1',
    patientWallet: '0x745a0d1c99dcc7c1016de17847db76b5852aacd6',
    hospitalWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    diagnosis: 'Malaria - Plasmodium falciparum',
    cost: 45000,
    treatmentPlan: 'Artemether/Lumefantrine combination therapy for 3 days',
    status: 'paid' as const,
    createdAt: '2024-03-14T10:00:00Z'
  },
  {
    id: 'invoice-2',
    patientWallet: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    hospitalWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    diagnosis: 'Wisdom Tooth Impaction',
    cost: 25000,
    treatmentPlan: 'Surgical extraction under local anesthesia',
    status: 'pending' as const,
    createdAt: '2024-03-18T15:30:00Z'
  }
];
