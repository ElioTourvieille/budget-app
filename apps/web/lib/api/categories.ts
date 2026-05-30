import { fetcher } from './client';
import type { Category, MessageResponse } from './types';

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}

export interface ListCategoriesParams {
  isSystem?: boolean;
}

export const categoriesApi = {
  list: (params?: ListCategoriesParams) =>
    fetcher.get<Category[]>('/categories', params),

  getById: (id: string) =>
    fetcher.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput) =>
    fetcher.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryInput) =>
    fetcher.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    fetcher.delete<MessageResponse>(`/categories/${id}`),
};
