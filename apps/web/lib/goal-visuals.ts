import { Plane, LifeBuoy, Landmark, ShoppingBag, Target, type LucideIcon } from 'lucide-react';
import type { GoalType } from './api/types';

export const GOAL_TYPE_ICONS: Record<GoalType, LucideIcon> = {
  VACATION: Plane,
  EMERGENCY: LifeBuoy,
  THIRD_PILLAR: Landmark,
  PURCHASE: ShoppingBag,
  OTHER: Target,
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  VACATION: 'Vacances',
  EMERGENCY: "Fonds d'urgence",
  THIRD_PILLAR: '3e pilier A',
  PURCHASE: 'Achat',
  OTHER: 'Autre',
};

// Le 3e pilier A a sa propre page dédiée (/third-pillar) — pas proposé ici.
export const SELECTABLE_GOAL_TYPES: GoalType[] = ['VACATION', 'EMERGENCY', 'PURCHASE', 'OTHER'];
