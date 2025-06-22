#!/usr/bin/env node

/**
 * Staging Mode Toggle Script
 * Helper to quickly switch between staging and live modes
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

console.log('🚀 PracticeQs Staging Mode Toggle');
console.log('==================================');

if (!command || !['staging', 'live', 'status'].includes(command)) {
  console.log('\nUsage:');
  console.log('  node toggle-staging.js staging  # Set to staging mode');
  console.log('  node toggle-staging.js live     # Set to live mode');
  console.log('  node toggle-staging.js status   # Check current status');
  console.log('\nNote: This only updates local .env files. You still need to:');
  console.log('  1. Update environment variables in Railway (backend)');
  console.log('  2. Update environment variables in Vercel (frontend)');
  console.log('  3. Redeploy both services');
  process.exit(1);
}

const envFiles = [
  '.env',
  'Backend/.env'
];

function updateEnvFile(filePath, isLive) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const value = isLive ? 'true' : 'false';
  
  // Update or add IS_LIVE_PUBLIC
  if (content.includes('IS_LIVE_PUBLIC=')) {
    content = content.replace(/IS_LIVE_PUBLIC=.*/g, `IS_LIVE_PUBLIC=${value}`);
  } else {
    content += `\nIS_LIVE_PUBLIC=${value}\n`;
  }
  
  // Update or add VITE_IS_LIVE_PUBLIC (for frontend)
  if (content.includes('VITE_IS_LIVE_PUBLIC=')) {
    content = content.replace(/VITE_IS_LIVE_PUBLIC=.*/g, `VITE_IS_LIVE_PUBLIC=${value}`);
  } else if (filePath === '.env') {
    content += `VITE_IS_LIVE_PUBLIC=${value}\n`;
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Updated ${filePath}`);
}

function checkStatus() {
  console.log('\n📊 Current Status:');
  
  envFiles.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`   ${filePath}: Not found`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/IS_LIVE_PUBLIC=(.+)/);
    const viteMatch = content.match(/VITE_IS_LIVE_PUBLIC=(.+)/);
    
    const isLive = match?.[1]?.trim() === 'true';
    const viteIsLive = viteMatch?.[1]?.trim() === 'true';
    
    console.log(`   ${filePath}:`);
    console.log(`     IS_LIVE_PUBLIC: ${isLive ? '🟢 LIVE' : '🟡 STAGING'}`);
    if (viteMatch) {
      console.log(`     VITE_IS_LIVE_PUBLIC: ${viteIsLive ? '🟢 LIVE' : '🟡 STAGING'}`);
    }
  });
}

switch (command) {
  case 'staging':
    console.log('\n🟡 Setting to STAGING mode...');
    envFiles.forEach(file => updateEnvFile(file, false));
    console.log('\n✅ Local environment files updated to staging mode.');
    console.log('\n⚠️  Remember to also update:');
    console.log('   1. Railway environment variables (IS_LIVE_PUBLIC=false)');
    console.log('   2. Vercel environment variables (VITE_IS_LIVE_PUBLIC=false)');
    console.log('   3. Redeploy both services');
    break;
    
  case 'live':
    console.log('\n🟢 Setting to LIVE mode...');
    envFiles.forEach(file => updateEnvFile(file, true));
    console.log('\n✅ Local environment files updated to live mode.');
    console.log('\n⚠️  Remember to also update:');
    console.log('   1. Railway environment variables (IS_LIVE_PUBLIC=true)');
    console.log('   2. Vercel environment variables (VITE_IS_LIVE_PUBLIC=true)');
    console.log('   3. Redeploy both services');
    console.log('\n🚨 IMPORTANT: Site will be publicly accessible after deployment!');
    break;
    
  case 'status':
    checkStatus();
    break;
}

console.log('\n📖 For deployment instructions, see PRODUCTION_WEBHOOK_CHECKLIST.md'); 