// Test script for Task 5 features
// Run with: node test-task5-features.js

const BASE_URL = 'http://localhost:3003';

async function testEndpoints() {
  console.log('🧪 Testing Task 5 API Endpoints...\n');

  const tests = [
    {
      name: 'List Templates',
      url: '/api/templates',
      method: 'GET'
    },
    {
      name: 'Get Single Template',
      url: '/api/templates/clz1example', // Will fail but tests endpoint
      method: 'GET'
    },
    {
      name: 'Get Template Suggestions',
      url: '/api/templates/suggestions?assetId=test',
      method: 'GET'
    },
    {
      name: 'List Schedules',
      url: '/api/schedules',
      method: 'GET'
    },
    {
      name: 'Cron Job Status',
      url: '/api/cron/process-schedules',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(BASE_URL + test.url, {
        method: test.method,
        headers: {
          'Cookie': 'next-auth.session-token=your-session-token' // Replace with actual
        }
      });

      const status = response.status;
      const statusText = response.statusText;

      if (status === 401) {
        console.log(`  ⚠️  Status: ${status} - Requires authentication`);
      } else if (status >= 200 && status < 300) {
        console.log(`  ✅ Status: ${status} - Success`);
      } else if (status === 404) {
        console.log(`  ⚠️  Status: ${status} - Resource not found (expected for some tests)`);
      } else {
        console.log(`  ❌ Status: ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

testEndpoints().catch(console.error);