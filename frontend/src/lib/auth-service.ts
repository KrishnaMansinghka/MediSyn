/**
 * MediSyn Authentication Service
 * Frontend service for authentication using PostgreSQL backend API
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  
  // Doctor fields
  clinic_name?: string;
  doctor_name?: string;
  
  // Patient fields
  name?: string;
  date_of_birth?: string;
  address?: string;
}

export interface User {
  user_id: number;
  email: string;
  user_type: 'doctor' | 'patient';
  user_name: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: number;
  user_type: 'doctor' | 'patient';
  user_name: string;
  email: string;
}

export interface SessionData {
  sessionId?: string;
  userId: number;
  userType: 'doctor' | 'patient';
  userName: string;
  email: string;
  token: string;
}

const API_BASE_URL = 'http://localhost:8001';
const SESSION_KEY = 'medisyn_session';

class MediSynAuthService {
  private static instance: MediSynAuthService;

  private constructor() {}

  public static getInstance(): MediSynAuthService {
    if (!MediSynAuthService.instance) {
      MediSynAuthService.instance = new MediSynAuthService();
    }
    return MediSynAuthService.instance;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    const session = this.getCurrentSession();
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * User signup
   */
  async signup(signupData: SignupData): Promise<{ message: string; user_id: number; user_type: string; user_name: string; email: string }> {
    try {
      const response = await this.apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });

      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store session data
      const sessionData: SessionData = {
        userId: response.user_id,
        userType: response.user_type,
        userName: response.user_name,
        email: response.email,
        token: response.access_token,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await this.apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local session
      localStorage.removeItem(SESSION_KEY);
    }
  }

  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await this.apiRequest('/auth/me');
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Get current session from localStorage
   */
  getCurrentSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Error reading session:', error);
    }
    return null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.getCurrentSession() !== null;
  }

  /**
   * Get current user type
   */
  getUserType(): 'doctor' | 'patient' | null {
    const session = this.getCurrentSession();
    return session?.userType || null;
  }

  /**
   * Get all doctors (for testing/admin purposes)
   */
  async getAllDoctors(): Promise<any[]> {
    try {
      return await this.apiRequest('/auth/users/doctors');
    } catch (error) {
      console.error('Failed to get doctors:', error);
      throw error;
    }
  }

  /**
   * Get all patients (for testing/admin purposes)
   */
  async getAllPatients(): Promise<any[]> {
    try {
      return await this.apiRequest('/auth/users/patients');
    } catch (error) {
      console.error('Failed to get patients:', error);
      throw error;
    }
  }

  /**
   * Check if API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/`);
      return true;
    } catch (error) {
      console.warn('Auth API health check failed:', error);
      return false;
    }
  }

  /**
   * Require authentication - redirect if not logged in
   */
  requireAuth(navigate: (path: string) => void): SessionData | null {
    const session = this.getCurrentSession();
    if (!session) {
      navigate('/medicare/login');
      return null;
    }
    return session;
  }

  /**
   * Require specific user type - redirect if wrong type
   */
  requireUserType(
    userType: 'doctor' | 'patient',
    navigate: (path: string) => void
  ): SessionData | null {
    const session = this.requireAuth(navigate);
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
  }
}

// Export singleton instance
export const mediSynAuthService = MediSynAuthService.getInstance();

// Legacy compatibility functions for existing code
export const getCurrentSession = () => mediSynAuthService.getCurrentSession();
export const isLoggedIn = () => mediSynAuthService.isLoggedIn();
export const getUserType = () => mediSynAuthService.getUserType();
export const logout = () => mediSynAuthService.logout();
export const requireAuth = (navigate: (path: string) => void) => mediSynAuthService.requireAuth(navigate);
export const requireUserType = (userType: 'doctor' | 'patient', navigate: (path: string) => void) => 
  mediSynAuthService.requireUserType(userType, navigate);