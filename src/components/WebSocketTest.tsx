// Test WebSocket connection with Render wake-up
import { useNotifications } from '@/context/NotificationContext';

const WebSocketTest = () => {
  const { wsConnected, wsConnecting, wsError, retryCount, wakeUpRender } = useNotifications();

  const testWakeUp = async () => {
    console.log('🔄 Testing wake-up...');
    const success = await wakeUpRender();
    console.log('✅ Wake-up result:', success);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>WebSocket Connection Test</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {wsConnected ? '✅ Connected' : wsConnecting ? '🔄 Connecting...' : '❌ Disconnected'}
      </div>
      
      {wsError && (
        <div style={{ marginBottom: '10px', color: 'red' }}>
          <strong>Error:</strong> {wsError}
        </div>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Retry Count:</strong> {retryCount}/3
      </div>
      
      <button 
        onClick={testWakeUp}
        style={{ 
          padding: '10px 20px', 
          background: '#007acc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Test Wake-Up
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h4>Instructions:</h4>
        <ul>
          <li>Click "Test Wake-Up" to ping the backend</li>
          <li>Check console for wake-up logs</li>
          <li>WebSocket should connect automatically after successful wake-up</li>
          <li>Watch retry count and connection status</li>
        </ul>
      </div>
    </div>
  );
};

export default WebSocketTest;
