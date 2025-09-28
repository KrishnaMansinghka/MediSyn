/**
 * Authentication utility functions for session management
 * Updated to use PostgreSQL backend
 */
import { mediSynAuthService } from './auth-service';

export interface SessionData {
  sessionId?: string;
  userId: number;
  userType: 'doctor' | 'patient';
  userName: string;
  email: string;
  token: string;
}

/**
 * Get current session from localStorage
 */
export const getCurrentSession = (): SessionData | null => {
  return mediSynAuthService.getCurrentSession();
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return mediSynAuthService.isLoggedIn();
};

/**
 * Get current user type
 */
export const getUserType = (): 'doctor' | 'patient' | null => {
  return mediSynAuthService.getUserType();
};

/**
 * Logout user by clearing session
 */
export const logout = async (): Promise<void> => {
  await mediSynAuthService.logout();
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