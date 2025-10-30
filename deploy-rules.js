#!/usr/bin/env node

/**
 * Deploy Firestore Security Rules
 * 
 * This script deploys the updated Firestore security rules to Firebase.
 * Run with: node deploy-rules.js
 * 
 * Make sure you have Firebase CLI installed and are logged in:
 * npm install -g firebase-tools
 * firebase login
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firestore Security Rules...\n');

// Check if firestore.rules exists
const rulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ Error: firestore.rules file not found!');
  process.exit(1);
}

// Check if firebase.json exists
const configPath = path.join(__dirname, 'firebase.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ Error: firebase.json file not found!');
  console.log('Please run: firebase init firestore');
  process.exit(1);
}

try {
  // Deploy only Firestore rules
  console.log('📤 Deploying rules to Firebase...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Firestore security rules deployed successfully!');
  console.log('\n📋 Rules Summary:');
  console.log('   • Questions: Public read, authenticated create/vote');
  console.log('   • Answers: Public read, authenticated create, nested replies');
  console.log('   • Study Groups: Public browse, authenticated join/create');
  console.log('   • Users: Authenticated read, owner/admin write');
  console.log('   • Courses: Public read, lecturer create');
  console.log('   • Forums: Public read, authenticated participate');
  console.log('   • Chat: Participant-only access');
  console.log('   • Admin: Full access to reports, analytics, settings');
  
} catch (error) {
  console.error('\n❌ Error deploying rules:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Make sure you\'re logged in: firebase login');
  console.log('   2. Check your project: firebase use --add');
  console.log('   3. Verify rules syntax: firebase firestore:rules:validate');
  process.exit(1);
}
