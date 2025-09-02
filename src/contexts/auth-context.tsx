
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        Cookies.set('user', JSON.stringify(user));
      } else {
        Cookies.remove('user');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {isLoading ? <div className="flex h-screen items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
