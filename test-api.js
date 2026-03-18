// Simple test script to check API connectivity
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';
const AUTH_BASE_URL = API_BASE_URL + '/auth';

const testAPI = async () => {
  try {
    console.log('🧪 Testing API connectivity...');
    console.log('📡 API Base URL:', API_BASE_URL);
    console.log('🔐 Auth Base URL:', AUTH_BASE_URL);
    
    // Test basic API health
    const healthResponse = await fetch('https://ai-mshm-backend.onrender.com/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API Health Check:', healthData);
    } else {
      console.error('❌ API Health Check Failed:', healthResponse.status, healthResponse.statusText);
    }
    
    // Test register endpoint with minimal data
    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123',
          confirm_password: 'testpassword123',
          role: 'patient'
        }),
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        console.log('✅ Register Test:', registerData);
      } else {
        const errorData = await registerResponse.json();
        console.error('❌ Register Test Failed:', errorData);
      }
    } catch (err) {
      console.error('❌ Register Test Error:', err);
    }
    
  } catch (err) {
    console.error('❌ API Test Error:', err);
  }
};

// Run the test
testAPI();
