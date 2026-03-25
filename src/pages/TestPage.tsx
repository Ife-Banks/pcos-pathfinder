import React from 'react';
import { Button } from '@/components/ui/button';
import { rppgService } from '@/services/rppgService';
import { dashboardService } from '@/services/dashboardService';

const TestPage: React.FC = () => {
  const testRPPGIntegration = async () => {
    console.log('🧪 Testing rPPG Integration...');
    
    try {
      // Test rPPG sessions
      const sessions = await rppgService.getSessions();
      console.log('✅ rPPG sessions:', sessions.data.sessions.length);
      
      // Test metabolic predictions
      const metabolic = await rppgService.predictMetabolicCardio();
      console.log('✅ Metabolic predictions:', metabolic.data.predictions);
      
      // Test reproductive predictions  
      const reproductive = await rppgService.predictStressReproductive();
      console.log('✅ Reproductive predictions:', reproductive.data.predictions);
      
      // Test dashboard integration
      const mlPredictions = await dashboardService.getMLPredictions();
      console.log('✅ Dashboard ML predictions:', mlPredictions.data);
      
      alert('✅ All rPPG tests passed! Check console for details.');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert(`❌ Test failed: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ML Integration Test</h1>
      
      <div className="space-y-4">
        <Button onClick={testRPPGIntegration} className="w-full">
          Test rPPG Integration
        </Button>
        
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">What this tests:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>rPPG service endpoints</li>
            <li>Metabolic risk predictions</li>
            <li>Reproductive risk predictions</li>
            <li>Dashboard ML integration</li>
            <li>API connectivity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
