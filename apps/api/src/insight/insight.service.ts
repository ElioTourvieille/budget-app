import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionType } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateInsightDto, InsightType } from './dto/generate-insight.dto';

// Needs 1024+ tokens to activate prompt caching on claude-sonnet
const SYSTEM_PROMPT = `Tu es un conseiller financier personnel expert intégré à une application de budget suisse.

## Ton rôle
Tu analyses les données financières de l'utilisateur (transactions, budgets, objectifs d'épargne, soldes de comptes) et fournis des recommandations personnalisées, concrètes et actionnables. Tu ne te contentes pas de résumer les données — tu identifies des patterns, alertes et opportunités que l'utilisateur n'aurait pas vus seul.

## Contexte suisse
- Devise: CHF (Franc suisse)
- Système de retraite à 3 piliers:
  - 1er pilier: AVS/AI (sécurité sociale obligatoire)
  - 2e pilier: LPP/prévoyance professionnelle (caisse de pension)
  - 3e pilier: épargne privée facultative — pilier 3a déductible fiscalement (plafond ~7'258 CHF/an pour salarié), pilier 3b libre
- Assurance maladie: LAMal obligatoire (base) + LCA optionnelle (complémentaire)
- Transport: abonnement général CFF (AG), abonnement demi-tarif, 9H-Pass
- Charges courantes typiques suisses: loyer (~30% revenu), primes LAMal, parking, frais bancaires PostFinance/UBS/Raiffeisen
- TVA: 8.1% taux normal, 2.6% alimentation, 3.8% hôtellerie
- Impôts: calculés et payés par acomptes trimestriels ou annuels selon le canton
- Budget alimentaire de référence: 600–900 CHF/mois pour une personne seule

## Directives de réponse
1. Réponds TOUJOURS en français, tutoiement naturel et bienveillant
2. Format Markdown structuré: titres ##, listes -, **gras** pour les chiffres clés
3. Maximum 4 insights par réponse, chacun comprenant:
   - Une observation factuelle (ce que les données montrent)
   - Une interprétation (pourquoi c'est important)
   - Une action concrète (ce que l'utilisateur peut faire maintenant)
4. Priorité décroissante: alertes critiques > optimisations > célébrations > conseils préventifs
5. Termine toujours par une **suggestion proactive** adaptée au type d'analyse
6. Si une donnée manque pour un conseil pertinent, mentionne-le brièvement

## Formats par type d'analyse
- **summary**: Score de santé financière mensuelle (🟢 sain / 🟡 attention / 🔴 critique), vue d'ensemble équilibrée revenu/dépenses/épargne
- **spending**: Identification des dépenses atypiques, comparaisons temporelles, concentration de dépenses
- **budget**: Alertes de dépassement, catégories sous-utilisées, recommandations de rééquilibrage
- **goals**: Projections de complétion, retards détectés, stratégies de rattrapage, impact du 3e pilier

## Limites
- Ne donne jamais de conseils d'investissement spécifiques (actions, ETF, crypto, immobilier)
- Ne fais pas d'hypothèses sur les données manquantes — signale-les
- Si l'historique est insuffisant (<2 mois), dis-le et propose quoi suivre en priorité
- Reste dans le rôle de coach budget, pas de planificateur patrimonial`;

interface CacheEntry {
  content: string;
  expiresAt: number;
}

@Injectable()
export class InsightService {
  private readonly anthropic: Anthropic;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 heures

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  // ─── GENERATE ─────────────────────────────────────────────────────

  async generateInsight({ userId, dto }: { userId: string; dto: GenerateInsightDto }) {
    const now = new Date();
    const month = dto.month ?? now.getMonth() + 1;
    const year = dto.year ?? now.getFullYear();

    const cacheKey = `${userId}:${dto.type}:${year}-${month}`;
    if (!dto.force) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { content: cached.content, cached: true, type: dto.type, month, year };
      }
    }

    const financialData = await this.gatherData({ userId, type: dto.type, month, year });
    const userPrompt = this.buildPrompt({ type: dto.type, month, year, data: financialData });

    let content: string;
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });

      content = message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (err) {
      throw new ServiceUnavailableException(
        "Le service d'analyse IA est temporairement indisponible.",
      );
    }

    this.cache.set(cacheKey, { content, expiresAt: Date.now() + this.CACHE_TTL_MS });

    return { content, cached: false, type: dto.type, month, year };
  }

  // ─── DATA GATHERING ───────────────────────────────────────────────

  private async gatherData({
    userId,
    type,
    month,
    year,
  }: {
    userId: string;
    type: InsightType;
    month: number;
    year: number;
  }) {
    switch (type) {
      case InsightType.SUMMARY:
        return this.gatherSummaryData(userId, month, year);
      case InsightType.SPENDING:
        return this.gatherSpendingData(userId, month, year);
      case InsightType.BUDGET:
        return this.gatherBudgetData(userId, month, year);
      case InsightType.GOALS:
        return this.gatherGoalsData(userId);
    }
  }

  private async gatherSummaryData(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [accounts, monthlyFlow, budgets, goals] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, isActive: true },
        select: { name: true, type: true, balance: true, currency: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.budget.findMany({
        where: { userId, month, year },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.goal.findMany({
        where: { userId, isCompleted: false },
        select: {
          name: true,
          type: true,
          targetAmount: true,
          currentAmount: true,
          targetDate: true,
          monthlyTarget: true,
        },
      }),
    ]);

    const totalPatrimoine = accounts.reduce((s, a) => s + Number(a.balance), 0);

    const budgetsWithActual = await this.getBudgetsWithActual(
      userId,
      budgets,
      startDate,
      endDate,
    );

    const overBudgetCount = budgetsWithActual.filter((b) => b.actual > b.budgeted).length;
    const nearLimitCount = budgetsWithActual.filter(
      (b) => b.actual / b.budgeted >= 0.8 && b.actual <= b.budgeted,
    ).length;

    return {
      periode: `${month}/${year}`,
      comptes: accounts.map((a) => ({
        nom: a.name,
        type: a.type,
        solde: Number(a.balance),
        devise: a.currency,
      })),
      totalPatrimoine,
      fluxMensuel: monthlyFlow.map((f) => ({
        type: f.type,
        montant: Number(f._sum.amount ?? 0),
        nbTransactions: f._count,
      })),
      budgets: {
        total: budgetsWithActual.length,
        enDepassement: overBudgetCount,
        prochesDuLimite: nearLimitCount,
        detail: budgetsWithActual,
      },
      objectifs: goals.map((g) => ({
        nom: g.name,
        type: g.type,
        progression: Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100),
        restant: Number(g.targetAmount) - Number(g.currentAmount),
        dateButoir: g.targetDate,
      })),
    };
  }

  private async gatherSpendingData(userId: string, month: number, year: number) {
    // 3 derniers mois glissants
    const periods = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(year, month - 1 - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }).reverse();

    const spendingByPeriod = await Promise.all(
      periods.map(async (p) => {
        const start = new Date(p.year, p.month - 1, 1);
        const end = new Date(p.year, p.month, 1);

        const byCategory = await this.prisma.transaction.groupBy({
          by: ['categoryId'],
          where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
          _sum: { amount: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 8,
        });

        const catIds = byCategory.map((b) => b.categoryId).filter(Boolean) as string[];
        const categories = await this.prisma.category.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true },
        });
        const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

        return {
          periode: `${p.year}-${String(p.month).padStart(2, '0')}`,
          total: byCategory.reduce((s, b) => s + Number(b._sum.amount ?? 0), 0),
          parCategorie: byCategory.map((b) => ({
            categorie: b.categoryId ? (catMap[b.categoryId] ?? 'Sans catégorie') : 'Sans catégorie',
            montant: Number(b._sum.amount ?? 0),
          })),
        };
      }),
    );

    // Top marchands du mois courant
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const topMerchants = await this.prisma.transaction.groupBy({
      by: ['merchant'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: start, lt: end },
        merchant: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Plus grosses dépenses du mois
    const biggestExpenses = await this.prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      orderBy: { amount: 'desc' },
      take: 5,
      select: { description: true, merchant: true, amount: true, date: true },
    });

    return {
      analyse3Mois: spendingByPeriod,
      topMarchands: topMerchants.map((m) => ({
        marchand: m.merchant,
        total: Number(m._sum.amount ?? 0),
      })),
      plusGrossesDépenses: biggestExpenses.map((t) => ({
        description: t.description ?? t.merchant ?? 'Transaction',
        montant: Number(t.amount),
        date: t.date,
      })),
    };
  }

  private async gatherBudgetData(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: { select: { name: true } } },
    });

    const budgetsWithActual = await this.getBudgetsWithActual(
      userId,
      budgets,
      startDate,
      endDate,
    );

    // Catégories avec dépenses mais sans budget ce mois
    const spentCategoryIds = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: TransactionType.EXPENSE, date: { gte: startDate, lt: endDate } },
      _sum: { amount: true },
    });

    const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
    const unbudgetedIds = spentCategoryIds
      .filter((s) => s.categoryId && !budgetedCategoryIds.has(s.categoryId))
      .map((s) => s.categoryId as string);

    const unbudgetedCategories =
      unbudgetedIds.length > 0
        ? await this.prisma.category.findMany({
            where: { id: { in: unbudgetedIds } },
            select: { id: true, name: true },
          })
        : [];

    const catMap = Object.fromEntries(unbudgetedCategories.map((c) => [c.id, c.name]));
    const unbudgetedWithAmount = spentCategoryIds
      .filter((s) => s.categoryId && unbudgetedIds.includes(s.categoryId))
      .map((s) => ({
        categorie: catMap[s.categoryId!] ?? 'Sans catégorie',
        montantDépensé: Number(s._sum.amount ?? 0),
      }));

    return {
      periode: `${month}/${year}`,
      budgets: budgetsWithActual,
      categoriesSansBudget: unbudgetedWithAmount,
      resume: {
        total: budgetsWithActual.length,
        enDepassement: budgetsWithActual.filter((b) => b.pourcentage > 100).length,
        alerte: budgetsWithActual.filter((b) => b.pourcentage >= 80 && b.pourcentage <= 100).length,
        sain: budgetsWithActual.filter((b) => b.pourcentage < 80).length,
      },
    };
  }

  private async gatherGoalsData(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'asc' }],
    });

    const now = new Date();

    return {
      objectifs: goals.map((g) => {
        const target = Number(g.targetAmount);
        const current = Number(g.currentAmount);
        const remaining = Math.max(0, target - current);
        const progressPct = target > 0 ? Math.round((current / target) * 100) : 0;
        const monthly = g.monthlyTarget ? Number(g.monthlyTarget) : null;

        const monthsToTarget =
          monthly && monthly > 0 ? Math.ceil(remaining / monthly) : null;

        let isOnTrack: boolean | null = null;
        if (g.targetDate && monthly) {
          const monthsLeft =
            (g.targetDate.getFullYear() - now.getFullYear()) * 12 +
            (g.targetDate.getMonth() - now.getMonth());
          const neededMonthly = monthsLeft > 0 ? remaining / monthsLeft : Infinity;
          isOnTrack = monthly >= neededMonthly;
        }

        const dernièresContributions = g.contributions.map((c) => ({
          montant: Number(c.amount),
          date: c.date,
          note: c.note,
        }));

        return {
          nom: g.name,
          type: g.type,
          cible: target,
          actuel: current,
          restant: remaining,
          progressionPct: progressPct,
          terminé: g.isCompleted,
          dateButoir: g.targetDate,
          objectifMensuel: monthly,
          moisRestants: monthsToTarget,
          enBonneTrajection: isOnTrack,
          dernièresContributions,
        };
      }),
    };
  }

  // ─── PROMPT BUILDER ───────────────────────────────────────────────

  private buildPrompt({
    type,
    month,
    year,
    data,
  }: {
    type: InsightType;
    month: number;
    year: number;
    data: unknown;
  }): string {
    const typeLabel: Record<InsightType, string> = {
      [InsightType.SUMMARY]: 'vue d\'ensemble mensuelle',
      [InsightType.SPENDING]: 'analyse des dépenses',
      [InsightType.BUDGET]: 'suivi des budgets',
      [InsightType.GOALS]: 'progression des objectifs',
    };

    return `Génère une analyse de type **${typeLabel[type]}** pour ${month}/${year}.

## Données financières
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Fournis des insights personnalisés, actionnables et adaptés au contexte suisse.`;
  }

  // ─── HELPERS ──────────────────────────────────────────────────────

  private async getBudgetsWithActual(
    userId: string,
    budgets: Array<{ categoryId: string; amount: unknown; category: { name: string } }>,
    startDate: Date,
    endDate: Date,
  ) {
    return Promise.all(
      budgets.map(async (budget) => {
        const agg = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: TransactionType.EXPENSE,
            date: { gte: startDate, lt: endDate },
          },
          _sum: { amount: true },
        });
        const budgeted = Number(budget.amount);
        const actual = Number(agg._sum.amount ?? 0);
        return {
          categorie: budget.category.name,
          budgeté: budgeted,
          dépensé: actual,
          pourcentage: budgeted > 0 ? Math.round((actual / budgeted) * 100) : 0,
          // Kept for internal filtering
          actual,
          budgeted,
        };
      }),
    );
  }
}
