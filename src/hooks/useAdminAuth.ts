import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID ?? '';

/**
 * Returns whether the currently signed-in Firebase user is the authorised admin.
 * Any non-admin account that somehow ends up signed in is immediately ejected.
 * Long-press entry point and admin routes should gate on `isAdmin`.
 */
export function useAdminAuth(): { isAdmin: boolean; loading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
      } else if (!ADMIN_UID || user.uid !== ADMIN_UID) {
        // A non-admin account signed in — eject silently.
        await signOut(auth);
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { isAdmin, loading };
}
