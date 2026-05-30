import { fetcher } from './client';
import type { AuthResponse, User, MessageResponse } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    fetcher.post<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, firstName?: string) =>
    fetcher.post<AuthResponse>('/auth/register', { email, password, firstName }),

  me: () =>
    fetcher.get<User>('/auth/me'),

  resetPasswordRequest: (email: string) =>
    fetcher.post<MessageResponse>('/auth/reset-password-request', { email }),

  verifyResetToken: (token: string) =>
    fetcher.get<{ valid: boolean }>('/auth/verify-reset-token', { token }),

  resetPassword: (token: string, password: string) =>
    fetcher.post<MessageResponse>('/auth/reset-password', { token, password }),
};
