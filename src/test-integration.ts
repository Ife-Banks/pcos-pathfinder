// Test script to verify ML integration
import { rppgService } from './services/rppgService';
import { menstrualService } from './services/menstrualService';
import { dashboardService } from './services/dashboardService';

async function testIntegration() {
  console.log('🧪 Testing ML Integration...\n');

  try {
    // Test 1: Check if services are properly imported
    console.log('✅ Services imported successfully');
    
    // Test 2: Test menstrual service endpoints
    console.log('\n📊 Testing Menstrual Service...');
    try {
      const features = await menstrualService.getFeatures();
      console.log('✅ Menstrual features endpoint works');
    } catch (error) {
      console.log('❌ Menstrual features failed:', error);
    }

    // Test 3: Test rPPG service endpoints
    console.log('\n💓 Testing rPPG Service...');
    try {
      const sessions = await rppgService.getSessions();
      console.log('✅ rPPG sessions endpoint works');
    } catch (error) {
      console.log('❌ rPPG sessions failed:', error);
    }

    // Test 4: Test dashboard ML predictions
    console.log('\n📈 Testing Dashboard ML Predictions...');
    try {
      const predictions = await dashboardService.getMLPredictions();
      console.log('✅ Dashboard ML predictions works');
      if (predictions.data.menstrual_risks) {
        console.log('✅ Menstrual risks available:', Object.keys(predictions.data.menstrual_risks));
      }
      if (predictions.data.rppg_risks) {
        console.log('✅ rPPG risks available:', Object.keys(predictions.data.rppg_risks));
      }
    } catch (error) {
      console.log('❌ Dashboard ML predictions failed:', error);
    }

    console.log('\n🎉 Integration test completed!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Export for manual testing
export { testIntegration };
