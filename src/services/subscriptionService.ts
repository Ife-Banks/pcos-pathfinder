import apiClient from './apiClient';

export interface SubscriptionData {
  id: string;
  plan: 'trial' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  trial_start: string;
  trial_end: string;
  paid_start: string | null;
  paid_end: string | null;
  is_active: boolean;
  is_trial: boolean;
  days_remaining: number;
  has_premium_access: boolean;
}

export const subscriptionAPI = {
  getStatus: async (): Promise<SubscriptionData> => {
    const res = await apiClient.get('/subscriptions/status/');
    return res.data.data;
  },
  initiatePayment: async (plan: 'basic' | 'premium', callbackUrl: string) => {
    const res = await apiClient.post('/subscriptions/initiate/', {
      plan,
      callback_url: callbackUrl,
    });
    return res.data as { authorization_url: string; reference: string };
  },
  verifyPayment: async (reference: string) => {
    const res = await apiClient.post('/subscriptions/verify/', { reference });
    return res.data.data as SubscriptionData;
  },
};
