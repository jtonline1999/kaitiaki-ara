
'use client';

import { useAuth as useFirebaseAuth } from '@/hooks/use-auth';
import type { User } from 'firebase/auth';

// This file is now a compatibility layer to avoid breaking existing components
// that use the old useAuth hook. It now delegates to the new useAuth hook.

/**
 * @deprecated Use `useAuth` from `@/hooks/use-auth` instead.
 */
export function useAuth() {
  const { user, isLoading } = useFirebaseAuth();
  return { user, loading: isLoading };
}
