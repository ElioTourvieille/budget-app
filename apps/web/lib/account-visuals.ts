import { Wallet, Users, PiggyBank, Landmark, Banknote, CircleDollarSign, type LucideIcon } from 'lucide-react';
import type { AccountType } from './api/types';

export const ACCOUNT_TYPE_ICONS: Record<AccountType, LucideIcon> = {
  CHECKING: Wallet,
  JOINT: Users,
  SAVINGS: PiggyBank,
  THIRD_PILLAR: Landmark,
  CASH: Banknote,
  OTHER: CircleDollarSign,
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Compte courant',
  JOINT: 'Compte joint',
  SAVINGS: 'Épargne',
  THIRD_PILLAR: '3e pilier A',
  CASH: 'Espèces',
  OTHER: 'Autre',
};
