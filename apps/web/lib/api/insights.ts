import { fetcher } from './client';
import type { InsightResponse, InsightType } from './types';

export interface GenerateInsightParams {
  type: InsightType;
  month?: number;
  year?: number;
  force?: boolean;
}

export const insightsApi = {
  generate: (params: GenerateInsightParams) =>
    fetcher.get<InsightResponse>('/insights', params),
};
