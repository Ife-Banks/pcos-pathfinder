import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';

interface PHCCentre {
  id: string;
  name: string;
  address: string;
  state: string;
  lga: string;
  phone?: string;
}

const Step7HealthCentre = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    state: '',
    lga: ''
  });
  
  const [healthCentres, setHealthCentres] = useState<PHCCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PHCCentre | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Nigerian states for dropdown
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ];

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
  }, [accessToken, navigate]);

  const handleInputChange = (field: 'state' | 'lga', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const searchHealthCentres = async () => {
    if (!formData.state.trim()) {
      setError('Please select a state');
      return;
    }

    setSearching(true);
    setError(null);
    
    try {
      // Call the correct PHC search endpoint
      const response = await fetch(`/api/v1/centers/phc/?state=${encodeURIComponent(formData.state)}${formData.lga ? `&lga=${encodeURIComponent(formData.lga)}` : ''}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to search PHC centres');
      }
      
      const data = await response.json();
      setHealthCentres(data.data || []);
      setShowResults(true);
    } catch (err) {
      console.error('Error searching PHC centres:', err);
      // Fallback to mock data for development
      const mockCentres: PHCCentre[] = [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'Primary Health Centre',
          address: '123 Main Street',
          state: formData.state,
          lga: formData.lga || 'Central',
          phone: '+234-123-456-7890'
        },
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
          name: 'Community Health Center',
          address: '456 Health Road',
          state: formData.state,
          lga: formData.lga || 'North',
          phone: '+234-987-654-3210'
        }
      ];
      setHealthCentres(mockCentres);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCentre = (centre: HealthCentre) => {
    setSelectedCentre(centre);
  };

  const handleBack = () => {
    navigate('/onboarding/step/6');
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mark onboarding as complete without selecting a health centre
      const result = await onboardingAPI.markComplete(accessToken);
      if (result.success) {
        navigate(result.data.redirect || '/dashboard');
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!formData.state.trim()) {
      setError('Please select a state before continuing');
      return;
    }

    // Allow continuing without PHC selection (optional step)
    const hccId = selectedCentre?.id || null;

    setLoading(true);
    try {
      // Save PHC selection using the correct API
      await onboardingAPI.saveStep7HealthCentre(accessToken, {
        state: formData.state,
        lga: formData.lga,
        registered_hcc: hccId
      });

      // Mark onboarding as complete
      const result = await onboardingAPI.markComplete(accessToken);
      if (result.success) {
        navigate(result.data.redirect || '/dashboard');
      }
    } catch (err: any) {
      console.error('Error saving PHC selection:', err);
      
      // Handle specific error case for blocked patients
      if (err?.error?.includes('ASSIGNED') || err?.error?.includes('UNDER_TREATMENT')) {
        setError(`Cannot change PHC while you have an active case. ${err?.error || ''}`);
      } else {
        setError(err?.message || 'Failed to save PHC selection. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Step 7 of 7</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Optional</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Health Centre</h1>
            <p className="text-gray-600 text-sm">
              Select a Primary Health Centre (PHC) for routing care based on risk levels
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">e.g. Lagos</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-1">
                LGA (optional)
              </Label>
              <Input
                id="lga"
                type="text"
                placeholder="e.g. Surulere"
                value={formData.lga}
                onChange={(e) => handleInputChange('lga', e.target.value)}
              />
            </div>

            <Button 
              onClick={searchHealthCentres}
              disabled={searching || !formData.state.trim()}
              className="w-full"
            >
              {searching ? 'Searching...' : 'Search for PHC Centres'}
            </Button>
          </div>

          {/* Search Results */}
          {showResults && healthCentres.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Available PHC Centres</h3>
              {healthCentres.map(centre => (
                <div
                  key={centre.id}
                  onClick={() => handleSelectCentre(centre)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCentre?.id === centre.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{centre.name}</div>
                  <div className="text-sm text-gray-600">{centre.address}</div>
                  <div className="text-xs text-gray-500">
                    {centre.lga}, {centre.state}
                  </div>
                  {centre.phone && (
                    <div className="text-xs text-gray-500">{centre.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              ← Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip →
              </Button>
              
              {selectedCentre && (
                <Button
                  onClick={handleContinue}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              )}
              
              <Button
                onClick={handleContinue}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Continue Without Selection'}
              </Button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can change your health centre later from profile settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step7HealthCentre;
