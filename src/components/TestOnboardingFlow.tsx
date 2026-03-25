import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { rppgService } from '@/services/rppgService';
import { onboardingAPI } from '@/services/onboardingService';
import { dashboardService } from '@/services/dashboardService';
import { menstrualService } from '@/services/menstrualService';

const TestOnboardingFlow: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string, success: boolean) => {
    const prefix = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `${prefix} ${message}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: rPPG Service
    try {
      const sessions = await rppgService.getSessions();
      addResult('rPPG Service - Get Sessions', true);
      addResult(`Found ${sessions.data.sessions.length} rPPG sessions`, true);
    } catch (error) {
      addResult(`rPPG Service Error: ${error}`, false);
    }

    // Test 2: rPPG Predictions
    try {
      const metabolicPred = await rppgService.predictMetabolicCardio();
      addResult('rPPG Metabolic Predictions', true);
      addResult(`CVD Risk: ${(metabolicPred.data.predictions.CVD * 100).toFixed(1)}%`, true);
    } catch (error) {
      addResult(`rPPG Metabolic Error: ${error}`, false);
    }

    // Test 3: Menstrual Service
    try {
      const menstrualPred = await menstrualService.getMenstrualPrediction();
      addResult('Menstrual Service - Predictions', true);
      addResult(`Infertility Risk: ${(menstrualPred.data.predictions.Infertility.risk_probability * 100).toFixed(1)}%`, true);
    } catch (error) {
      addResult(`Menstrual Service Error: ${error}`, false);
    }

    // Test 4: Dashboard ML Integration
    try {
      const mlPredictions = await dashboardService.getMLPredictions();
      addResult('Dashboard ML Integration', true);
      
      if (mlPredictions.data.menstrual_risks) {
        addResult('Menstrual risks available in dashboard', true);
      }
      if (mlPredictions.data.rppg_risks) {
        addResult('rPPG risks available in dashboard', true);
      }
    } catch (error) {
      addResult(`Dashboard ML Error: ${error}`, false);
    }

    // Test 5: Simulate Step 6 Save
    try {
      await onboardingAPI.saveStep6rPPG();
      addResult('Step 6 rPPG Save', true);
    } catch (error) {
      addResult(`Step 6 Save Error: ${error}`, false);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">ML Integration Test Suite</h2>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>
        <Button variant="outline" onClick={clearResults}>
          Clear Results
        </Button>
      </div>

      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
            {result}
          </div>
        ))}
      </div>

      {testResults.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          Click "Run Integration Tests" to verify the ML integration
        </div>
      )}
    </div>
  );
};

export default TestOnboardingFlow;
