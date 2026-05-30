import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/lib/api/insights';
import type { GenerateInsightParams } from '@/lib/api/insights';
import { queryKeys } from './keys';

// 6h staleTime matches the server-side in-memory cache TTL
const INSIGHT_STALE_MS = 6 * 60 * 60 * 1000;

export function useInsight(params: GenerateInsightParams) {
  return useQuery({
    queryKey: queryKeys.insights.generate(params),
    queryFn:  () => insightsApi.generate(params),
    staleTime: params.force ? 0 : INSIGHT_STALE_MS,
    enabled:  !!params.type,
  });
}
