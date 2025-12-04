// Final test for Blog System
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080/api';

const waitForServer = async (maxAttempts = 15) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_BASE}/ping`);
      if (response.ok) {
        console.log('✅ Server is ready\n');
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Server not ready');
};

const testEndpoint = async (name: string, url: string, method = 'GET', body?: any) => {
  try {
    const options: any = { method };
    if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const status = response.status;
    
    if (status >= 200 && status < 300) {
      const data = await response.json();
      console.log(`✅ ${name}: OK (${status})`);
      if (Array.isArray(data)) {
        console.log(`   Found ${data.length} items`);
      }
      return { success: true, data };
    } else {
      const text = await response.text();
      console.log(`⚠️  ${name}: ${status}`);
      if (text.length < 200) console.log(`   ${text}`);
      return { success: false, status };
    }
  } catch (error: any) {
    console.log(`❌ ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const runTests = async () => {
  try {
    console.log('🧪 Testing Blog System API Endpoints...\n');
    
    await waitForServer();
    
    // Test public endpoints
    await testEndpoint('GET /api/blog/posts', `${API_BASE}/blog/posts`);
    await testEndpoint('GET /api/blog/posts (with params)', `${API_BASE}/blog/posts?status=published&limit=5`);
    
    // Test admin endpoints
    await testEndpoint('GET /api/admin/blog/posts', `${API_BASE}/admin/blog/posts`);
    await testEndpoint('GET /api/admin/blog/categories', `${API_BASE}/admin/blog/categories`);
    
    // Test AI endpoints (should fail without key)
    await testEndpoint('POST /api/ai/blog/posts (no key)', `${API_BASE}/ai/blog/posts`, 'POST', {
      title_en: 'Test'
    });
    
    // Test AI management endpoints
    await testEndpoint('GET /api/admin/ai/keys', `${API_BASE}/admin/ai/keys`);
    await testEndpoint('GET /api/admin/ai/activity', `${API_BASE}/admin/ai/activity`);
    
    console.log('\n✅ All endpoint tests completed!');
    console.log('\n📝 Note: Some endpoints may return empty arrays if no data exists yet.');
    console.log('   This is normal for a fresh installation.');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

runTests();


