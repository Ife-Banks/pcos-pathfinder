import { useNavigate } from 'react-router-dom';
import PHCLayout from '@/components/phc/PHCLayout';

// This redirects to Dashboard which contains the patient queue
export default function PHCPatients() {
  const navigate = useNavigate();
  // PHC Dashboard contains the patient queue — redirect
  if (typeof window !== 'undefined') {
    navigate('/phc/dashboard', { replace: true });
  }
  return <PHCLayout><div /></PHCLayout>;
}
