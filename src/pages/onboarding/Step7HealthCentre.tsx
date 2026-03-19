import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { onboardingAPI } from '@/services/onboardingService';
import { phcAPI } from '@/services/phcService';

interface PHCCentre {
  id: string;
  name: string;
  code?: string;
  address?: string;
  state: string;
  lga: string;
  phone?: string;
}

const Step7HealthCentre = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    state: '',
    lga: ''
  });
  
  const [healthCentres, setHealthCentres] = useState<PHCCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PHCCentre | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestDescription, setChangeRequestDescription] = useState('');
  const [submittingChangeRequest, setSubmittingChangeRequest] = useState(false);

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
    
    if (profile) {
      setFormData({
        state: profile.state || '',
        lga: profile.lga || ''
      });
    }
  }, [accessToken, navigate, profile]);

  const handleInputChange = (field: 'state' | 'lga', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const searchHealthCentres = async () => {
    if (!formData.state.trim()) {
      setError('Please select a state');
      return;
    }

    setSearching(true);
    setError(null);
    setShowNoResults(false);
    setShowResults(false);
    
    try {
      console.log('Searching for PHCs with state:', formData.state, 'lga:', formData.lga);
      
      const data = await phcAPI.getPHCs(formData.state, formData.lga || undefined);
      
      console.log('PHC Search response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Handle both direct array or wrapped in { data: [] } format
      let results = data;
      if (data && typeof data === 'object' && 'data' in data) {
        results = data.data;
      }
      
      if (results && results.length > 0) {
        setHealthCentres(results);
        setShowResults(true);
      } else {
        setHealthCentres([]);
        setShowNoResults(true);
      }
    } catch (err: any) {
      console.error('Error searching PHC centres:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to search PHC centres. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCentre = (centre: PHCCentre) => {
    setSelectedCentre(centre);
  };

  const handleBack = () => {
    navigate('/onboarding/step/6');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleContinue = async () => {
    if (!formData.state.trim()) {
      setError('Please select a state before continuing');
      return;
    }

    const hccId = selectedCentre?.id || null;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await onboardingAPI.saveStep7HealthCentre(accessToken!, {
        state: formData.state,
        lga: formData.lga,
        registered_hcc: hccId
      });

      refreshProfile();
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving PHC selection:', err);
      
      if (err?.status === 400 || err?.message?.includes('active case') || err?.message?.includes('assigned')) {
        const errorMessage = err?.message || 'Cannot change health centre while you have an active case.';
        setError(errorMessage);
      } else {
        setError(err?.message || 'Failed to save PHC selection. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!changeRequestDescription.trim()) {
      return;
    }

    if (!selectedCentre) {
      setError('Please select a PHC first');
      return;
    }

    setSubmittingChangeRequest(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/centers/change-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          request_type: 'change_phc',
          requested_hcc: selectedCentre.id,
          description: changeRequestDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit change request');
      }

      setSuccessMessage('Your request has been submitted. We will review it and notify you in the app when it is actioned.');
      setShowChangeRequestModal(false);
      setChangeRequestDescription('');
    } catch (err: any) {
      console.error('Error submitting change request:', err);
      setError(err?.message || 'Failed to submit change request. Please try again.');
    } finally {
      setSubmittingChangeRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Step 7 of 7</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Optional</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Health Centre</h1>
            <p className="text-gray-600 text-sm">
              Select a Primary Health Centre (PHC) for routing care based on risk levels
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex flex-col gap-3">
                {error}
                {error.includes('active case') && selectedCentre && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangeRequestModal(true)}
                    className="w-fit"
                  >
                    Submit a Change Request
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

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

          {showNoResults && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No PHC centres found for the selected area. Try a different state or LGA.
              </p>
            </div>
          )}

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
                  {centre.code && (
                    <div className="text-xs text-gray-500">{centre.code}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {centre.lga}, {centre.state}
                  </div>
                </div>
              ))}
            </div>
          )}

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
            </div>
          </div>

          {selectedCentre && (
            <div className="mt-4">
              <Button
                onClick={handleContinue}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          )}

          {!selectedCentre && (
            <div className="mt-4">
              <Button
                onClick={handleContinue}
                disabled={loading || !formData.state.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Continue Without Selection'}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can change your health centre later from profile settings
            </p>
          </div>
        </CardContent>
      </Card>

      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Submit Change Request</h3>
            <div className="mb-4">
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Describe why you need to change your health centre
              </Label>
              <textarea
                id="description"
                rows={4}
                maxLength={500}
                value={changeRequestDescription}
                onChange={(e) => setChangeRequestDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="I moved to a new location and need to change to a closer health centre..."
              />
              <p className="text-xs text-gray-500 mt-1">{changeRequestDescription.length}/500 characters</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangeRequestModal(false);
                  setChangeRequestDescription('');
                }}
                disabled={submittingChangeRequest}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitChangeRequest}
                disabled={submittingChangeRequest || !changeRequestDescription.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submittingChangeRequest ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7HealthCentre;