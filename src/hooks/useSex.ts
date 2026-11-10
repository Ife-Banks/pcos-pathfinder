import { useAuth } from '@/context/AuthContext';

export type Sex = 'male' | 'female';

/**
 * Male only when the profile says so. Anything else (blank, null, female)
 * keeps the existing female screens, so nobody's current experience changes.
 */
export function useSex(): Sex {
  const { user } = useAuth();
  return (user?.gender ?? '').toLowerCase() === 'male' ? 'male' : 'female';
}