import { supabase } from './supabaseClient.js';

// Replace these values
const USER_ID = '5fc91a1e-26bf-47ba-8b00-6d1ad5708d5f'; // Replace with the actual user ID

async function deleteUser() {
  try {
    console.log(`🗑️ Starting deletion process for user: ${USER_ID}`);
    
    // Step 1: Delete from profiles table
    console.log('📝 Deleting from profiles table...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', USER_ID);
    
    if (profileError) {
      console.error('❌ Error deleting profile:', profileError);
    } else {
      console.log('✅ Profile deleted successfully');
    }
    
    // Step 2: Delete from usage_logs table
    console.log('📊 Deleting from usage_logs table...');
    const { error: usageError } = await supabase
      .from('usage_logs')
      .delete()
      .eq('user_id', USER_ID);
    
    if (usageError) {
      console.error('❌ Error deleting usage logs:', usageError);
    } else {
      console.log('✅ Usage logs deleted successfully');
    }
    
    // Step 3: Delete from subscriptions table
    console.log('💳 Deleting from subscriptions table...');
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', USER_ID);
    
    if (subscriptionError) {
      console.error('❌ Error deleting subscriptions:', subscriptionError);
    } else {
      console.log('✅ Subscriptions deleted successfully');
    }
    
    // Step 4: Delete from auth system (this is the admin API call)
    console.log('🔐 Deleting from auth system...');
    const { error: authError } = await supabase.auth.admin.deleteUser(USER_ID);
    
    if (authError) {
      console.error('❌ Error deleting from auth:', authError);
    } else {
      console.log('✅ User deleted from auth system successfully');
    }
    
    console.log(`🎉 User ${USER_ID} has been completely removed and can now sign up again!`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the deletion
deleteUser(); 