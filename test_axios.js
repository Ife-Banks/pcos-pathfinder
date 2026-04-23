import axios from 'axios';

const client = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1' });

// Log what axios sends
client.interceptors.request.use((config) => {
  console.log('Request URL:', config.url);
  console.log('Method:', config.method);
  console.log('Data:', config.data);
  console.log('Headers:', config.headers);
  return config;
});

client.post('/auth/login/', { email: 'ifebanks02@gmail.com', password: 'testpass123' })
  .then(r => console.log('Success:', r.status))
  .catch(e => console.log('Error:', e.response?.status, e.response?.data));