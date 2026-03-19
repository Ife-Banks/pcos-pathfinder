// Token Persistence Verification Script
// Run this in the browser console after PHC login to verify tokens are saved

console.log('=== PHC Token Persistence Check ===');

// Check if tokens exist in localStorage
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

console.log('Access Token:', accessToken);
console.log('Refresh Token:', refreshToken);

// Verify token format (JWT tokens start with 'eyJ')
const isValidJWT = (token) => {
  return token && token.startsWith('eyJ') && token.split('.').length === 3;
};

console.log('Access Token Valid JWT:', isValidJWT(accessToken));
console.log('Refresh Token Valid JWT:', isValidJWT(refreshToken));

// Check AuthContext state
const authContextEvent = new CustomEvent('get-auth-state');
window.dispatchEvent(authContextEvent);

// Test API call (this will be done automatically when navigating to dashboard)
console.log('=== Instructions ===');
console.log('1. Both tokens should be long strings starting with "eyJ"');
console.log('2. Navigate to /phc/dashboard');
console.log('3. Check network tab for queue API call');
console.log('4. Should see 200 status instead of 401');

if (!accessToken || !refreshToken) {
  console.error('❌ TOKENS NOT FOUND - Login issue persists');
} else if (!isValidJWT(accessToken) || !isValidJWT(refreshToken)) {
  console.error('❌ INVALID TOKEN FORMAT - Login issue persists');
} else {
  console.log('✅ TOKENS FOUND AND VALID - Login should work');
}
