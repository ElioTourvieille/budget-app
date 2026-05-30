// ─── SHARED ───────────────────────────────────────────────────────

export type Decimal = string; // Prisma Decimal sérialisé en string dans JSON

// ─── AUTH ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────

export type AccountType = 'CHECKING' | 'JOINT' | 'SAVINGS' | 'THIRD_PILLAR' | 'CASH' | 'OTHER';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bank?: string;
  color?: string;
  icon?: string;
  balance: Decimal;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsResponse {
  accounts: Account[];
  totalBalance: number;
}

// ─── CATEGORIES ───────────────────────────────────────────────────

export interface Category {
  id: string;
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type ReimbursementStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';
export type InsuranceType = 'LAMAL' | 'LCA' | 'OTHER';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  amount: Decimal;
  type: TransactionType;
  description?: string;
  merchant?: string;
  date: string;
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
  isReimbursable: boolean;
  reimbursementStatus?: ReimbursementStatus;
  insuranceType?: InsuranceType;
  reimbursedAmount?: Decimal;
  reimbursedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  account?: Account;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── BUDGETS ──────────────────────────────────────────────────────

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: Decimal;
  month: number;
  year: number;
  createdAt: string;
  category: Category;
}

export interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetSummary {
  budgets: BudgetWithProgress[];
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
}

// ─── GOALS ────────────────────────────────────────────────────────

export type GoalType = 'VACATION' | 'EMERGENCY' | 'THIRD_PILLAR' | 'PURCHASE' | 'OTHER';

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: Decimal;
  date: string;
  note?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  targetDate?: string;
  monthlyTarget?: Decimal;
  type: GoalType;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  contributions?: GoalContribution[];
  // Champs calculés par le service
  progressPercent: number;
  remaining: number;
  monthsToTarget?: number | null;
  estimatedCompletionDate?: string;
  isOnTrack?: boolean;
}

// ─── INSIGHTS ─────────────────────────────────────────────────────

export type InsightType = 'summary' | 'spending' | 'budget' | 'goals';

export interface InsightResponse {
  content: string;
  cached: boolean;
  type: InsightType;
  month: number;
  year: number;
}

// ─── COMMON ───────────────────────────────────────────────────────

export interface MessageResponse {
  message: string;
}
