import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '@/lib/api/categories';
import type { CreateCategoryInput, ListCategoriesParams, UpdateCategoryInput } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useCategories(params?: ListCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn:  () => categoriesApi.list(params),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn:  () => categoriesApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Catégorie créée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de créer la catégorie'));
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: (category) => {
      qc.setQueryData(queryKeys.categories.detail(category.id), category);
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Catégorie mise à jour');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de mettre à jour la catégorie'));
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Catégorie supprimée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de supprimer la catégorie'));
    },
  });
}
