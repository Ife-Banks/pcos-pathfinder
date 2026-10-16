import { useEffect, useState, type ReactNode } from 'react';
import { directPatientService } from '@/services/directPatientService';
import Step7EmergencyHospitals from './Step7EmergencyHospitals';

interface Step7RouteProps {
  standard: ReactNode; // what non-direct patients see
}

/**
 * Onboarding step 7 switch:
 *  - direct patient (self signup)  -> emergency hospital picker
 *  - everyone else                 -> the standard step 7 screen
 */
const Step7Route = ({ standard }: Step7RouteProps) => {
  const [isDirect, setIsDirect] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    directPatientService
      .getStatus()
      .then((res: any) => {
        const payload = res?.data ?? res;
        if (!cancelled) setIsDirect(Boolean(payload?.is_direct));
      })
      .catch(() => {
        if (!cancelled) setIsDirect(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isDirect === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return isDirect ? <Step7EmergencyHospitals /> : <>{standard}</>;
};

export default Step7Route;