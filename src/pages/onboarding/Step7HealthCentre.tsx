import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { onboardingAPI } from '@/services/onboardingService';
import { phcAPI } from '@/services/phcService';
import { lgaAPI } from '@/services/lgaService';
import apiClient from '@/services/apiClient';
import { CheckCircle2, MapPin, Search, Building2, ArrowRight, ArrowLeft, SkipForward } from 'lucide-react';

interface PHCCentre {
  id: string;
  name: string;
  code?: string;
  address?: string;
  state: string;
  lga: string;
  facility_type?: string;
  phone?: string;
}

interface StateOption {
  state_id: string;
  state_name: string;
  lgas: { id: string; name: string; is_lcda: boolean }[];
}

const Step7HealthCentre = () => {
  const navigate = useNavigate();
  const { accessToken, refreshUser } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [states, setStates] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [formData, setFormData] = useState({ state: '', lga: '' });
  const [healthCentres, setHealthCentres] = useState<PHCCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PHCCentre | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestDescription, setChangeRequestDescription] = useState('');
  const [submittingChangeRequest, setSubmittingChangeRequest] = useState(false);

  const selectedState = states.find(s => s.state_name === formData.state);
  const lgas = selectedState?.lgas?.map(l => l.name) || [];

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await lgaAPI.listLgas();
        setStates(res?.data?.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (profile) {
      setFormData({ state: profile.state || '', lga: profile.lga || '' });
      if (profile.registered_hcc_detail) {
        const phc = profile.registered_hcc_detail;
        setSelectedCentre({
          id: phc.id, name: phc.name, code: phc.code,
          address: (phc as any).address, facility_type: (phc as any).facility_type,
          state: phc.state, lga: phc.lga,
        });
      }
    }
  }, [accessToken, navigate, profile]);

  const handleInputChange = (field: 'state' | 'lga', value: string) => {
    if (field === 'state') {
      setFormData({ state: value, lga: '' });
      setShowResults(false);
      setShowNoResults(false);
      setSearchAttempted(false);
      setSelectedCentre(null);
    } else {
      setFormData(prev => ({ ...prev, lga: value }));
    }
    setError(null);
  };

  const searchHealthCentres = async () => {
    if (!formData.state.trim()) {
      setError('Please select a state');
      return;
    }
    setSearching(true);
    setError(null);
    setShowResults(false);
    setShowNoResults(false);
    setSearchAttempted(true);
    setSelectedCentre(null);
    
    try {
      const data = await phcAPI.getPHCs(formData.state, formData.lga || undefined);
      let results = Array.isArray(data) ? data : (data?.data || []);
      if (results.length > 0) {
        setHealthCentres(results);
        setShowResults(true);
      } else {
        setShowNoResults(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search PHC centres. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCentre && !formData.state.trim()) {
      setError('Please select a health centre or continue without one');
      return;
    }
    setConfirming(true);
    setError(null);
    try {
      await onboardingAPI.saveStep7HealthCentre({
        state: formData.state,
        lga: formData.lga,
        registered_hcc: selectedCentre?.id || null
      });
      await onboardingAPI.markComplete();
      refreshProfile();
      refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.status === 400 || err?.message?.includes('active case')) {
        setError(err?.message || 'Cannot change health centre while you have an active case.');
      } else {
        setError(err?.message || 'Failed to save. Please try again.');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!changeRequestDescription.trim() || !selectedCentre) return;
    setSubmittingChangeRequest(true);
    try {
      const res = await apiClient.post('/centers/change-request/', {
        request_type: 'change_phc',
        requested_hcc: selectedCentre.id,
        description: changeRequestDescription,
      });
      if (res.data.status !== 'success') throw res.data;
      setSuccessMessage('Your request has been submitted and is pending review.');
      setShowChangeRequestModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit change request.');
    } finally {
      setSubmittingChangeRequest(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#2E8B57] rounded-full" style={{ width: '100%' }} />
          </div>
          <span className="text-sm font-medium text-[#2E8B57]">Step 7 of 7</span>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#2E8B57]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-[#2E8B57]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Health Centre</h1>
              <p className="text-gray-600 text-sm">
                Choose a Primary Health Centre (PHC) for your care routing
              </p>
            </div>

            {selectedCentre && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-[#2E8B57]/5 border-2 border-[#2E8B57]/30 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2E8B57] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#2E8B57] mb-1">Selected Centre</p>
                    <p className="font-semibold text-gray-900">{selectedCentre.name}</p>
                    <p className="text-sm text-gray-600">{selectedCentre.lga}, {selectedCentre.state}</p>
                    {selectedCentre.code && <p className="text-xs text-gray-500 mt-1">Code: {selectedCentre.code}</p>}
                  </div>
                  <button onClick={() => setSelectedCentre(null)} className="text-gray-400 hover:text-gray-600 text-xs">
                    Change
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="flex flex-col gap-3">
                  {error}
                  {error.includes('active case') && (
                    <Button variant="outline" size="sm" onClick={() => setShowChangeRequestModal(true)} className="w-fit">
                      Submit Change Request
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
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">State *</Label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={loadingStates}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2E8B57] focus:ring-0 bg-white text-base"
                >
                  <option value="">{loadingStates ? 'Loading states...' : 'Select your state'}</option>
                  {states.map(s => <option key={s.state_id} value={s.state_name}>{s.state_name}</option>)}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">LGA (optional)</Label>
                {formData.state ? (
                  <select
                    value={formData.lga}
                    onChange={(e) => handleInputChange('lga', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2E8B57] focus:ring-0 bg-white text-base"
                  >
                    <option value="">All LGAs in {formData.state}</option>
                    {lgas.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                  </select>
                ) : (
                  <Input
                    placeholder="Select a state first"
                    disabled
                    className="bg-gray-50"
                  />
                )}
              </div>

              <Button 
                onClick={searchHealthCentres}
                disabled={searching || !formData.state.trim()}
                className="w-full bg-[#2E8B57] hover:bg-[#247049] h-12 text-base font-medium"
              >
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Health Centres
                  </span>
                )}
              </Button>
            </div>

            {showNoResults && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 text-center">
                  No PHC centres found for this area. You can continue without selecting one.
                </p>
              </div>
            )}

            {showResults && healthCentres.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 space-y-3"
              >
                <p className="text-sm font-medium text-gray-700">{healthCentres.length} centre{healthCentres.length !== 1 ? 's' : ''} found</p>
                {healthCentres.map((centre) => (
                  <motion.button
                    key={centre.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCentre(centre)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      selectedCentre?.id === centre.id
                        ? 'border-[#2E8B57] bg-[#2E8B57]/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedCentre?.id === centre.id ? 'border-[#2E8B57] bg-[#2E8B57]' : 'border-gray-300'
                      }`}>
                        {selectedCentre?.id === centre.id && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{centre.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {centre.lga}, {centre.state}
                        </p>
                        {centre.facility_type && (
                          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {centre.facility_type}
                          </span>
                        )}
                        {centre.code && <p className="text-xs text-gray-500 mt-1">Code: {centre.code}</p>}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div className="mt-8 space-y-3">
              {selectedCentre ? (
                <Button 
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full bg-[#2E8B57] hover:bg-[#247049] h-12 text-base font-medium"
                >
                  {confirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Confirm & Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirm}
                  disabled={confirming || !formData.state.trim()}
                  className="w-full bg-[#2E8B57] hover:bg-[#247049] h-12 text-base font-medium"
                >
                  {confirming ? 'Saving...' : 'Continue Without Selection'}
                </Button>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/onboarding/step/6')}
                  className="text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await onboardingAPI.markComplete();
                      refreshProfile();
                      refreshUser();
                    } catch {}
                    navigate('/dashboard');
                  }}
                  disabled={loading}
                  className="text-gray-500"
                >
                  Skip for now
                  <SkipForward className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              You can change your health centre later from profile settings
            </p>
          </CardContent>
        </Card>
      </div>

      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold mb-2">Request Health Centre Change</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your request will be reviewed. You'll be notified when it's approved.
            </p>
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Reason</Label>
              <textarea
                rows={3}
                maxLength={500}
                value={changeRequestDescription}
                onChange={(e) => setChangeRequestDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2E8B57] text-base"
                placeholder="I moved to a new location..."
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{changeRequestDescription.length}/500</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowChangeRequestModal(false); setChangeRequestDescription(''); }}
                disabled={submittingChangeRequest}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitChangeRequest}
                disabled={submittingChangeRequest || !changeRequestDescription.trim()}
                className="flex-1 bg-[#2E8B57] hover:bg-[#247049]"
              >
                {submittingChangeRequest ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Step7HealthCentre;