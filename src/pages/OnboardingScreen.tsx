import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.onboarding_completed) {
      navigate('/dashboard');
      return;
    }
    // Resume at correct step
    const step = user.onboarding_step || 0;
    const nextStep = Math.min(step + 1, 7);
    navigate(`/onboarding/step/${nextStep}`, { replace: true });
  }, [user, navigate]);

  // Show nothing while redirecting
  return null;
};

export default OnboardingScreen;
