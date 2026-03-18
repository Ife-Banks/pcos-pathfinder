// Simple test script to check API connectivity
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

// Generate unique email with timestamp
const timestamp = Date.now();
const testEmail = `test${timestamp}@example.com`;

const testAPI = async () => {
  try {
    console.log('🧪 Testing API connectivity...');
    console.log('📡 API Base URL:', API_BASE_URL);
    console.log('📧 Test Email:', testEmail);
    
    // Test health endpoint (same as Swagger UI)
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
      console.log('📤 Testing register endpoint:', `${API_BASE_URL}/auth/register/`);
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Test User',
          email: testEmail,
          password: 'testpassword123',
          confirm_password: 'testpassword123',
          role: 'patient'
        }),
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        console.log('✅ Register Test:', registerData);
        
        // Auto-verify the email immediately
        console.log('🔍 Auto-verifying email...');
        
        // For testing, we'll try to get the verification token from the registration response
        // or use a mock token for testing purposes
        let verificationToken = registerData?.verification_token;
        
        if (!verificationToken) {
          // If no token in response, we can't auto-verify
          console.log('⚠️ No verification token in response. Manual verification required.');
          console.log('📧 Check your email for verification link or use the resend endpoint.');
          
          // Test resend verification
          console.log('📤 Testing resend verification...');
          try {
            const resendResponse = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: testEmail
              }),
            });
            
            if (resendResponse.ok) {
              const resendData = await resendResponse.json();
              console.log('✅ Resend Verification:', resendData);
            } else {
              const resendError = await resendResponse.json();
              console.error('❌ Resend Verification Failed:', resendError);
            }
          } catch (resendErr) {
            console.error('❌ Resend Verification Error:', resendErr);
          }
        } else {
          // Auto-verify with the token
          try {
            console.log('🔍 Verifying with token:', verificationToken);
            const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: verificationToken
              }),
            });
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('✅ Email Verification Success:', verifyData);
              console.log('🎉 Registration and verification completed successfully!');
            } else {
              const verifyError = await verifyResponse.json();
              console.error('❌ Email Verification Failed:', verifyError);
            }
          } catch (verifyErr) {
            console.error('❌ Email Verification Error:', verifyErr);
          }
        }
        
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
