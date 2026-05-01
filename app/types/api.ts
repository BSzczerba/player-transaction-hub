// ── Auth ──────────────────────────────────────────────────────────────────

export interface RegisterDto {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phoneNumber?: string
}

export interface LoginDto {
  emailOrUsername: string
  password: string
}

export interface RefreshTokenDto {
  token: string
  refreshToken: string
}

export interface ActivateAccountDto {
  token: string
}

export interface AuthResponseDto {
  token: string
  refreshToken: string
  expiresAt: string
  user: PlayerDto
  activationToken?: string
}

// ── Core entities ─────────────────────────────────────────────────────────

export interface PlayerDto {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: string
  role: 'Player' | 'Operator' | 'Administrator' | 'ComplianceOfficer'
  status: 'Active' | 'Suspended' | 'Closed' | 'PendingActivation'
  balance: number
  dailyDepositLimit: number
  dailyWithdrawalLimit: number
  emailVerified: boolean
  phoneVerified: boolean
  kycVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface TransactionDto {
  id: string
  playerId: string
  playerUsername: string
  type: 'Deposit' | 'Withdrawal'
  amount: number
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled' | 'Rejected'
  paymentMethodName?: string
  paymentGatewayReference?: string
  description?: string
  approvedById?: string
  approvedByUsername?: string
  approvedAt?: string
  rejectionReason?: string
  completedAt?: string
  isFlagged: boolean
  flagReason?: string
  balanceBefore?: number
  balanceAfter?: number
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface NotificationDto {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface PaymentMethodDto {
  id: string
  name: string
  type: 'CreditCard' | 'BankTransfer' | 'EWallet' | 'Crypto'
  isActive: boolean
  minAmount: number
  maxAmount: number
  feePercentage: number
  fixedFee: number
  processingTimeMinutes: number
  logoUrl?: string
}

// ── Transaction request DTOs ───────────────────────────────────────────────

export interface CreateDepositDto {
  amount: number
  paymentMethodId: string
  description?: string
}

export interface CreateWithdrawalDto {
  amount: number
  paymentMethodId: string
  description?: string
}

export interface TransactionFilterDto {
  page?: number
  pageSize?: number
  playerId?: string
  type?: number        // 1 = Deposit, 2 = Withdrawal
  status?: number      // 1 Pending, 2 Processing, 3 Completed, 4 Failed, 5 Cancelled, 6 Rejected
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  isFlagged?: boolean
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

// ── Admin / compliance DTOs ────────────────────────────────────────────────

export interface UpdatePlayerDto {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  dailyDepositLimit?: number
  dailyWithdrawalLimit?: number
  kycVerified?: boolean
  role?: string
}

export interface ComplianceSummaryDto {
  totalFlaggedTransactions: number
  pendingReview: number
  flaggedPlayersCount: number
  totalFlaggedAmount: number
}

export interface RiskProfileDto {
  player: PlayerDto
  totalTransactions: number
  flaggedTransactions: number
  totalDeposited: number
  totalWithdrawn: number
  recentFlaggedTransactions: TransactionDto[]
}

export interface FinancialSummaryDto {
  totalDeposits: number
  totalWithdrawals: number
  netFlow: number
  avgTransaction: number
  completedCount: number
  pendingCount: number
  rejectedCount: number
  flaggedCount: number
  breakdown: { date: string; deposits: number; withdrawals: number }[]
}

export interface AuditLogDto {
  id: string
  action: string
  entityType: string
  entityId: string
  performedByUsername: string
  oldValue?: string
  newValue?: string
  createdAt: string
}
