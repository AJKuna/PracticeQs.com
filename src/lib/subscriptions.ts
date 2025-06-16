import { supabase } from './supabase';

export interface SubscriptionInfo {
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate?: string;
  endDate?: string;
  isPremium: boolean;
  dailyLimit: number | null;
}

/**
 * Get detailed subscription information for a user
 */
export const getSubscriptionInfo = async (userId: string): Promise<SubscriptionInfo | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, subscription_start_date, subscription_end_date, daily_question_limit')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription info:', error);
      return null;
    }

    return {
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      startDate: profile.subscription_start_date,
      endDate: profile.subscription_end_date,
      isPremium: profile.subscription_tier === 'premium' || profile.subscription_tier === 'enterprise',
      dailyLimit: profile.daily_question_limit,
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return null;
  }
};

/**
 * Check if user has active premium subscription
 */
export const isPremiumUser = async (userId: string): Promise<boolean> => {
  const info = await getSubscriptionInfo(userId);
  return info?.isPremium && info?.status === 'active' || false;
};

/**
 * Get subscription history for a user
 */
export const getSubscriptionHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error getting subscription history:', error);
    return [];
  }
};

/**
 * Cancel subscription (this would typically call your backend to cancel in Stripe)
 */
export const cancelSubscription = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};

/**
 * Create customer portal session for subscription management
 */
export const createCustomerPortalSession = async (userId: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId,
        returnUrl: window.location.origin 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    return null;
  }
}; 