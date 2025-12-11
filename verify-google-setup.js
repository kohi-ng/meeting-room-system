#!/usr/bin/env node

/**
 * Quick Google Setup Verification Script
 * Run: node verify-google-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Google OAuth Setup...\n');

// Check backend .env
const backendEnv = path.join(__dirname, 'backend', '.env');
const frontendEnv = path.join(__dirname, 'frontend', '.env');

const checks = [];

// Read backend .env
if (fs.existsSync(backendEnv)) {
  const content = fs.readFileSync(backendEnv, 'utf8');
  
  const hasClientId = content.includes('GOOGLE_CLIENT_ID=') && !content.includes('GOOGLE_CLIENT_ID=YOUR_');
  const hasSecret = content.includes('GOOGLE_CLIENT_SECRET=') && !content.includes('GOOGLE_CLIENT_SECRET=YOUR_');
  const hasEmailUser = content.includes('EMAIL_USER=') && !content.includes('EMAIL_USER=your-');
  const hasEmailPass = content.includes('EMAIL_PASS=') && !content.includes('EMAIL_PASS=YOUR_');
  
  checks.push({
    name: '✅ backend/.env - GOOGLE_CLIENT_ID',
    status: hasClientId,
    fix: 'Update GOOGLE_CLIENT_ID in backend/.env'
  });
  
  checks.push({
    name: '✅ backend/.env - GOOGLE_CLIENT_SECRET',
    status: hasSecret,
    fix: 'Update GOOGLE_CLIENT_SECRET in backend/.env'
  });
  
  checks.push({
    name: '✅ backend/.env - EMAIL_USER',
    status: hasEmailUser,
    fix: 'Update EMAIL_USER in backend/.env'
  });
  
  checks.push({
    name: '✅ backend/.env - EMAIL_PASS',
    status: hasEmailPass,
    fix: 'Update EMAIL_PASS in backend/.env (16-char app password)'
  });
} else {
  console.error('❌ backend/.env not found!');
}

// Read frontend .env
if (fs.existsSync(frontendEnv)) {
  const content = fs.readFileSync(frontendEnv, 'utf8');
  
  const hasClientId = content.includes('REACT_APP_GOOGLE_CLIENT_ID=') && !content.includes('REACT_APP_GOOGLE_CLIENT_ID=YOUR_');
  
  checks.push({
    name: '✅ frontend/.env - REACT_APP_GOOGLE_CLIENT_ID',
    status: hasClientId,
    fix: 'Update REACT_APP_GOOGLE_CLIENT_ID in frontend/.env'
  });
} else {
  console.error('❌ frontend/.env not found!');
}

// Display results
let allPassed = true;
checks.forEach(check => {
  if (check.status) {
    console.log(`✅ ${check.name.replace('✅ ', '')}`);
  } else {
    console.log(`❌ ${check.name.replace('✅ ', '')}`);
    console.log(`   👉 ${check.fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All checks passed! Ready to test Google OAuth.');
  console.log('\nNext steps:');
  console.log('1. npm run dev (in backend)');
  console.log('2. npm start (in frontend)');
  console.log('3. Go to http://localhost:3000');
  console.log('4. Test "Đăng nhập với Google"');
} else {
  console.log('❌ Some checks failed. Update the missing credentials above.');
}
console.log('='.repeat(60) + '\n');

process.exit(allPassed ? 0 : 1);
