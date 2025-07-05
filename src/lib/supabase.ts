import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Profile Management System
class ProfileManager {
  private cache = new Map<string, { data: any; timestamp: number; }>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private failureCount = new Map<string, number>();
  private circuitBreakerState = new Map<string, { isOpen: boolean; openUntil: number; }>();
  
  // Configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 30 * 1000; // 30 seconds
  private readonly INITIAL_BACKOFF_DELAY = 1000; // 1 second

  private isCircuitBreakerOpen(userId: string): boolean {
    const state = this.circuitBreakerState.get(userId);
    if (!state || !state.isOpen) return false;
    
    if (Date.now() > state.openUntil) {
      // Circuit breaker timeout expired, reset
      this.circuitBreakerState.delete(userId);
      this.failureCount.set(userId, 0);
      return false;
    }
    
    return true;
  }

  private openCircuitBreaker(userId: string): void {
    this.circuitBreakerState.set(userId, {
      isOpen: true,
      openUntil: Date.now() + this.CIRCUIT_BREAKER_TIMEOUT
    });
    console.warn(`🚫 Circuit breaker opened for user ${userId}. Requests blocked for ${this.CIRCUIT_BREAKER_TIMEOUT/1000}s`);
  }

  private recordFailure(userId: string): void {
    const count = (this.failureCount.get(userId) || 0) + 1;
    this.failureCount.set(userId, count);
    
    if (count >= this.CIRCUIT_BREAKER_THRESHOLD) {
      this.openCircuitBreaker(userId);
    }
  }

  private recordSuccess(userId: string): void {
    this.failureCount.delete(userId);
    this.circuitBreakerState.delete(userId);
  }

  private getCachedProfile(userId: string): any | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(userId);
      return null;
    }
    
    return cached.data;
  }

  private setCachedProfile(userId: string, data: any): void {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  private async fetchProfileWithRetry(userId: string): Promise<any> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Profile fetch attempt ${attempt}/${this.MAX_RETRIES} for user ${userId}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          // Check if it's a "not found" error
          if (error.code === 'PGRST116') {
            console.warn(`⚠️ Profile not found for user ${userId}`);
            return null;
          }
          
          throw error;
        }
        
        console.log(`✅ Profile fetched successfully for user ${userId}`);
        this.recordSuccess(userId);
        this.setCachedProfile(userId, data);
        return data;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Profile fetch attempt ${attempt} failed for user ${userId}:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          const delay = this.INITIAL_BACKOFF_DELAY * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    this.recordFailure(userId);
    throw lastError;
  }

  async getProfile(userId: string): Promise<any> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(userId)) {
      console.warn(`🚫 Circuit breaker is open for user ${userId}. Request blocked.`);
      throw new Error('Profile service temporarily unavailable');
    }

    // Check cache first
    const cached = this.getCachedProfile(userId);
    if (cached) {
      console.log(`💾 Returning cached profile for user ${userId}`);
      return cached;
    }

    // Check if there's already a request in flight for this user
    const existingRequest = this.inFlightRequests.get(userId);
    if (existingRequest) {
      console.log(`🔄 Deduplicating profile request for user ${userId}`);
      return existingRequest;
    }

    // Create new request
    const requestPromise = this.fetchProfileWithRetry(userId)
      .finally(() => {
        // Clean up the in-flight request when done
        this.inFlightRequests.delete(userId);
      });

    // Store the promise to deduplicate concurrent requests
    this.inFlightRequests.set(userId, requestPromise);
    
    return requestPromise;
  }

  // Clear cache for a specific user (useful after profile updates)
  invalidateCache(userId: string): void {
    this.cache.delete(userId);
    console.log(`🗑️ Cache invalidated for user ${userId}`);
  }

  // Clear all caches (useful for testing)
  clearAllCaches(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
    this.failureCount.clear();
    this.circuitBreakerState.clear();
    console.log('🗑️ All profile caches cleared');
  }

  // Get cache stats for debugging
  getCacheStats(): any {
    return {
      cacheSize: this.cache.size,
      inFlightRequests: this.inFlightRequests.size,
      failureCounts: Object.fromEntries(this.failureCount),
      circuitBreakers: Object.fromEntries(this.circuitBreakerState)
    };
  }
}

// Create singleton instance
const profileManager = new ProfileManager();

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Enhanced Profile helpers with deduplication and caching
export const getProfile = async (userId: string) => {
  console.log(`🔍 getProfile called for user: ${userId}`);
  
  try {
    console.log(`🔍 Calling profileManager.getProfile for user: ${userId}`);
    const result = await profileManager.getProfile(userId);
    console.log(`🔍 profileManager.getProfile completed for user: ${userId}, result:`, result ? 'received' : 'null');
    return result;
  } catch (error) {
    console.error('❌ getProfile error:', error);
    console.log(`🔍 Returning null due to error for user: ${userId}`);
    return null;
  }
};

export const updateProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Invalidate cache after successful update
  profileManager.invalidateCache(userId);
  
  return data;
};

// Profile cache management utilities
export const invalidateProfileCache = (userId: string) => {
  profileManager.invalidateCache(userId);
};

export const clearAllProfileCaches = () => {
  profileManager.clearAllCaches();
};

export const getProfileCacheStats = () => {
  return profileManager.getCacheStats();
};

// Usage tracking
export const logUsage = async (userId: string, action: string, details?: Record<string, any>) => {
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      action,
      details,
    });
  if (error) throw error;
};

// Subscription helpers
export const getSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  updates: Partial<Database['public']['Tables']['subscriptions']['Update']>
) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}; 