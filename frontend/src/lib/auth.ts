/**
 * Authentication utility functions for session management
 */

export interface SessionData {
  sessionId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  userName: string;
  email: string;
}

const SESSION_KEY = 'medisyn_session';

/**
 * Get current session from localStorage
 */
export const getCurrentSession = (): SessionData | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch (error) {
    console.error('Error reading session:', error);
  }
  return null;
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return getCurrentSession() !== null;
};

/**
 * Get current user type
 */
export const getUserType = (): 'doctor' | 'patient' | null => {
  const session = getCurrentSession();
  return session?.userType || null;
};

/**
 * Logout user by clearing session
 */
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
  // Also clear the database session
  // This would typically invalidate the session in the database
};

/**
 * Require authentication - redirect if not logged in
 */
export const requireAuth = (navigate: (path: string) => void): SessionData | null => {
  const session = getCurrentSession();
  if (!session) {
    navigate('/medicare/login');
    return null;
  }
  return session;
};

/**
 * Require specific user type - redirect if wrong type
 */
export const requireUserType = (
  userType: 'doctor' | 'patient',
  navigate: (path: string) => void
): SessionData | null => {
  const session = requireAuth(navigate);
  if (session && session.userType !== userType) {
    // Redirect to appropriate dashboard
    if (userType === 'doctor') {
      navigate('/medicare/patient-dashboard');
    } else {
      navigate('/medicare/doctor-dashboard');
    }
    return null;
  }
  return session;
};