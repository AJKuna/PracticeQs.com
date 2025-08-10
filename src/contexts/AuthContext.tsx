import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, getProfile, invalidateProfileCache, getProfileCacheStats, clearAllProfileCaches } from '../lib/supabase';
import type { Database } from '../lib/database.types.js';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  showSplashScreen: boolean;
  closeSplashScreen: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Debug utilities (only available in development)
  getCacheStats?: () => any;
  clearCaches?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  
  // Use ref to track current user to avoid dependency issues
  const currentUserRef = useRef<User | null>(null);

  // Add debug utilities in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Expose debug functions to window object for easy access in dev tools
      (window as any).profileDebug = {
        getCacheStats: getProfileCacheStats,
        clearCaches: clearAllProfileCaches,
        getProfile: (userId: string) => getProfile(userId),
        profileState: { user, profile, loading, profileLoading }
      };
      console.log('🔧 Profile debug utilities available at window.profileDebug');
    }
  }, [user, profile, loading, profileLoading]);

  // Function to create or update profile with email from auth user
  const createOrUpdateProfile = async (authUser: User) => {
    console.log(`🔄 createOrUpdateProfile started for user: ${authUser.id}`);
    
    try {
      console.log(`🔍 Fetching existing profile for user: ${authUser.id}`);
      
      // First try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log(`🔍 Profile fetch completed for user: ${authUser.id}`);
      console.log(`🔍 Existing profile:`, existingProfile ? 'found' : 'not found');
      console.log(`🔍 Fetch error:`, fetchError ? fetchError.message : 'none');

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('❌ Error fetching profile:', fetchError);
        console.log(`🔄 createOrUpdateProfile completed with fetch error for user: ${authUser.id}`);
        return;
      }

      if (existingProfile) {
        console.log(`🔍 Profile exists - checking if email update needed for user: ${authUser.id}`);
        
        // Profile exists, update it with current email if it's missing
        if (!existingProfile.email && authUser.email) {
          console.log(`🔄 Updating profile email for user: ${authUser.id}`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: authUser.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', authUser.id);

          console.log(`🔍 Profile email update completed for user: ${authUser.id}`);
          console.log(`🔍 Update error:`, updateError ? updateError.message : 'none');

          if (updateError) {
            console.error('❌ Error updating profile email:', updateError);
          } else {
            console.log(`✅ Profile email updated successfully for user: ${authUser.id}`);
            // Invalidate cache after successful update
            invalidateProfileCache(authUser.id);
          }
        } else {
          console.log(`✅ Profile email already exists or no email to update for user: ${authUser.id}`);
        }
      } else {
        console.log(`🔄 Creating new profile for user: ${authUser.id}`);
        
        // Profile doesn't exist, create new one with email
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || '',
            subscription_tier: 'free',
            subscription_status: 'active',
            daily_question_limit: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        console.log(`🔍 Profile creation completed for user: ${authUser.id}`);
        console.log(`🔍 Insert error:`, insertError ? insertError.message : 'none');

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
        } else {
          console.log(`✅ Profile created successfully for user: ${authUser.id}`);
          // Invalidate cache after profile creation
          invalidateProfileCache(authUser.id);
        }
      }
      
      console.log(`✅ createOrUpdateProfile completed successfully for user: ${authUser.id}`);
    } catch (error) {
      console.error('❌ Error in createOrUpdateProfile:', error);
      console.log(`❌ createOrUpdateProfile failed for user: ${authUser.id}`);
      
      // ✅ CRITICAL: Don't let profile operations block the auth flow
      // The user should still be able to use the app even if profile operations fail
      console.warn('⚠️ Profile operation failed - continuing with auth flow');
    }
  };

  // Stable refreshProfile function that doesn't depend on user state
  const refreshProfile = useCallback(async () => {
    console.log(`🔄 refreshProfile called - starting`);
    
    const targetUser = currentUserRef.current;
    if (!targetUser) {
      console.log('📋 No user available for profile refresh');
      return;
    }
    
    console.log(`🔄 refreshProfile - user found: ${targetUser.id}`);
    
    // Prevent multiple simultaneous profile loads
    if (profileLoading) {
      console.log('🔄 Profile refresh already in progress, skipping...');
      return;
    }
    
    console.log('🔄 Starting profile refresh for user:', targetUser.id);
    console.log('🔄 Current profile state:', profile);
    
    console.log(`🔄 Setting profileLoading to true`);
    setProfileLoading(true);
    
    try {
      console.log(`🔄 Calling getProfile for user ${targetUser.id}`);
      const data = await getProfile(targetUser.id);
      
      console.log('📊 Profile data received:', data);
      
      if (data) {
        console.log(`✅ Setting profile data`);
        setProfile(data);
        console.log('✅ Profile refreshed successfully:', data);
      } else {
        console.warn('⚠️ Profile data not available - data is null/undefined');
        
        // ✅ FIX: If profile is null and we have a user, try creating the profile
        // This handles cases where user returns from external pages and profile fetch fails
        if (!profile && targetUser) {
          console.log('🔄 Profile is null but user exists - attempting to create/update profile');
          try {
            console.log(`🔄 Calling createOrUpdateProfile for retry`);
            await createOrUpdateProfile(targetUser);
            console.log(`✅ createOrUpdateProfile completed for retry`);
            
            // Retry fetching after profile creation
            console.log(`🔄 Retrying getProfile after creation`);
            const retryData = await getProfile(targetUser.id);
            
            if (retryData) {
              console.log(`✅ Setting profile data from retry`);
              setProfile(retryData);
              console.log('✅ Profile created and fetched successfully after retry:', retryData);
            } else {
              console.warn('⚠️ Profile still null after creation attempt');
            }
          } catch (createError) {
            console.error('❌ Error creating profile during refresh:', createError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      // Don't clear profile on error to maintain user experience
    } finally {
      console.log(`🔄 Setting profileLoading to false`);
      setProfileLoading(false);
      console.log('🔄 Profile refresh completed - profileLoading set to false');
    }
  }, [profileLoading]); // ✅ FIX: Remove profile dependency to prevent infinite loop

  // Handle auth state changes
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check active sessions and sets the user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        currentUserRef.current = sessionUser;
        
        if (sessionUser) {
          await createOrUpdateProfile(sessionUser);
          // Always refresh profile on initialization - don't check existing profile state
          console.log('🔄 Initializing auth - refreshing profile for user:', sessionUser.id);
          await refreshProfile();
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🔄 Auth initialization completed - loading set to false');
        }
      }
    };

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log(`🔐 Auth event: ${event}`);
      console.log(`🔐 Session user:`, session?.user?.id || 'null');
      
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      currentUserRef.current = sessionUser;
      
      if (sessionUser) {
        // Handle sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log(`🔄 Processing ${event} - starting profile operations`);
          
          // Show splash screen only on actual sign in, not token refresh
          if (event === 'SIGNED_IN') {
            setShowSplashScreen(true);
          }
          
          // ✅ CRITICAL FIX: Don't wait for profile operations to complete
          // Run them in the background so they don't block the auth flow
          createOrUpdateProfile(sessionUser).then(() => {
            console.log(`✅ Background createOrUpdateProfile completed for ${event}`);
            // After profile creation/update, refresh the profile data
            refreshProfile().then(() => {
              console.log(`✅ Background refreshProfile completed for ${event}`);
            }).catch(error => {
              console.error(`❌ Background refreshProfile failed for ${event}:`, error);
            });
          }).catch(error => {
            console.error(`❌ Background createOrUpdateProfile failed for ${event}:`, error);
          });
        }
      } else {
        // Handle sign out
        console.log(`🔐 Setting profile to null for event: ${event}`);
        setProfile(null);
        setShowSplashScreen(false);
      }
      
      console.log(`🔄 Setting loading to false for event: ${event}`);
      setLoading(false);
      console.log('🔄 Auth state change completed - loading set to false');
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // No dependencies - this effect should only run once

  // Update currentUserRef when user changes
  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const closeSplashScreen = () => {
    setShowSplashScreen(false);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    profileLoading,
    showSplashScreen,
    closeSplashScreen,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile,
    // Add debug utilities in development mode
    ...(import.meta.env.DEV && {
      getCacheStats: getProfileCacheStats,
      clearCaches: clearAllProfileCaches,
    }),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
