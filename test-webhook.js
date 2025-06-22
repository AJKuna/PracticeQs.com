#!/usr/bin/env node

/**
 * Stripe Webhook Testing Script
 * This script helps test and debug webhook functionality
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from './Backend/supabaseClient.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🧪 Stripe Webhook Testing Script');
console.log('==================================');

// Test 1: Verify environment variables
function testEnvironmentVariables() {
  console.log('\n📋 1. Testing Environment Variables...');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allGood = true;
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const exists = !!value;
    const length = value?.length || 0;
    
    console.log(`  ${exists ? '✅' : '❌'} ${varName}: ${exists ? `${length} chars` : 'MISSING'}`);
    if (!exists) allGood = false;
  });
  
  return allGood;
}

// Test 2: Test Supabase connection
async function testSupabaseConnection() {
  console.log('\n🗄️  2. Testing Supabase Connection...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('  ✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('  ❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Test 3: Test Stripe connection
async function testStripeConnection() {
  console.log('\n💳 3. Testing Stripe Connection...');
  
  try {
    const account = await stripe.accounts.retrieve();
    console.log('  ✅ Stripe connection successful');
    console.log(`  📊 Account: ${account.email || 'N/A'}`);
    return true;
  } catch (error) {
    console.log('  ❌ Stripe connection failed:', error.message);
    return false;
  }
}

// Test 4: List recent webhook events
async function listRecentWebhookEvents() {
  console.log('\n🎣 4. Recent Webhook Events...');
  
  try {
    const events = await stripe.events.list({
      limit: 10,
      types: ['checkout.session.completed']
    });
    
    console.log(`  📊 Found ${events.data.length} recent checkout.session.completed events`);
    
    events.data.forEach((event, index) => {
      const session = event.data.object;
      console.log(`  ${index + 1}. Event ${event.id}`);
      console.log(`     Session: ${session.id}`);
      console.log(`     User ID: ${session.client_reference_id || 'MISSING'}`);
      console.log(`     Status: ${session.payment_status}`);
      console.log(`     Created: ${new Date(event.created * 1000).toISOString()}`);
    });
    
    return events.data;
  } catch (error) {
    console.log('  ❌ Failed to fetch webhook events:', error.message);
    return [];
  }
}

// Test 5: Simulate webhook processing
async function simulateWebhookProcessing(testUserId) {
  console.log('\n🔄 5. Simulating Webhook Processing...');
  
  if (!testUserId) {
    console.log('  ⚠️  No test user ID provided, skipping simulation');
    return;
  }
  
  try {
    // Check if user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (userError) {
      console.log(`  ❌ Test user ${testUserId} not found:`, userError.message);
      return;
    }
    
    console.log('  ✅ Test user found:', {
      email: userProfile.email,
      current_tier: userProfile.subscription_tier
    });
    
    // Simulate the upgrade
    const updateData = {
      subscription_tier: 'premium',
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', testUserId);
    
    if (updateError) {
      console.log('  ❌ Failed to update test user:', updateError.message);
    } else {
      console.log('  ✅ Successfully updated test user to premium');
      
      // Revert the change
      const { error: revertError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', testUserId);
      
      if (revertError) {
        console.log('  ⚠️  Warning: Failed to revert test user changes');
      } else {
        console.log('  ✅ Test changes reverted successfully');
      }
    }
    
  } catch (error) {
    console.log('  ❌ Simulation failed:', error.message);
  }
}

// Test 6: Webhook endpoint health check
async function testWebhookEndpoint() {
  console.log('\n🌐 6. Testing Webhook Endpoint...');
  
  const webhookUrl = process.env.WEBHOOK_URL || 'https://practiceqscom-production.up.railway.app/api/stripe-webhook';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'GET'
    });
    
    console.log(`  📊 Webhook endpoint status: ${response.status}`);
    console.log(`  🌐 URL: ${webhookUrl}`);
    
    if (response.status === 405) {
      console.log('  ✅ Endpoint exists (405 = Method Not Allowed for GET is expected)');
    } else {
      console.log('  ⚠️  Unexpected response status');
    }
    
  } catch (error) {
    console.log('  ❌ Webhook endpoint test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('Starting comprehensive webhook tests...\n');
  
  const testUserId = process.argv[2]; // Optional test user ID
  if (testUserId) {
    console.log(`🧪 Using test user ID: ${testUserId}\n`);
  }
  
  const envTest = testEnvironmentVariables();
  const supabaseTest = await testSupabaseConnection();
  const stripeTest = await testStripeConnection();
  const webhookEvents = await listRecentWebhookEvents();
  await testWebhookEndpoint();
  await simulateWebhookProcessing(testUserId);
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`Environment Variables: ${envTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supabase Connection: ${supabaseTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stripe Connection: ${stripeTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Recent Events Found: ${webhookEvents.length} events`);
  
  if (envTest && supabaseTest && stripeTest) {
    console.log('\n🎉 All core tests passed! Your webhook should work correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
  }
  
  console.log('\n💡 To test with a specific user:');
  console.log('   node test-webhook.js <user-id>');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
} 