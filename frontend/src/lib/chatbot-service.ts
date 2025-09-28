/**
 * MediSyn Chatbot API Integration Service
 * Provides interface between frontend and backend chatbot
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  message: string;
  isComplete: boolean;
  reportGenerated?: boolean;
  error?: string;
}

export interface MedicalReport {
  summary: string;
  symptoms: string;
  onset: string;
  duration: string;
  severity: string;
  frequency: string;
  character: string;
  location: string;
  triggers_relief: string;
  associated_symptoms: string;
  medical_history: string;
  family_history: string;
  lifestyle_context: string;
}

class ChatbotService {
  private conversation: ChatMessage[] = [];
  private isSessionActive = false;
  private sessionId: string | null = null;

  /**
   * Initialize a new chatbot session
   */
  async startSession(patientName?: string, patientId?: string, appointmentId?: string): Promise<ChatbotResponse> {
    this.conversation = [];
    this.isSessionActive = true;
    
    const BACKEND_URL = 'http://localhost:8000';
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: patientName || 'Patient',
          patient_id: patientId || `patient_${Date.now()}`,
          appointment_id: appointmentId
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.sessionId = result.session_id;
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: result.initial_message,
        timestamp: new Date()
      };
      
      this.conversation.push(aiMessage);
      
      return {
        message: result.initial_message,
        isComplete: false
      };
      
    } catch (error) {
      console.error('Failed to start session:', error);
      return {
        message: "I'm sorry, I'm having trouble connecting. Please try again.",
        isComplete: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send a message to the chatbot and get response
   */
  async sendMessage(userMessage: string): Promise<ChatbotResponse> {
    if (!this.isSessionActive) {
      throw new Error('Chatbot session not active. Call startSession() first.');
    }

    // Add user message to conversation
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    this.conversation.push(userMsg);

    try {
      // Call the backend chatbot API
      const response = await this.callChatbotAPI(this.conversation);
      
      // Add AI response to conversation
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.message,
        timestamp: new Date()
      };
      
      this.conversation.push(aiMsg);
      
      // Check if conversation is complete
      if (response.isComplete) {
        this.isSessionActive = false;
      }
      
      return response;
    } catch (error) {
      console.error('Chatbot API error:', error);
      return {
        message: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        isComplete: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the current conversation history
   */
  getConversation(): ChatMessage[] {
    return [...this.conversation];
  }

  /**
   * End the current session
   */
  endSession(): void {
    this.isSessionActive = false;
    this.sessionId = null;
  }

  /**
   * Call the Python backend chatbot API
   */
  private async callChatbotAPI(conversation: ChatMessage[]): Promise<ChatbotResponse> {
    const BACKEND_URL = 'http://localhost:8000';
    
    try {
      // Get the last user message
      const lastUserMessage = conversation.filter(msg => msg.sender === 'user').pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }

      const response = await fetch(`${BACKEND_URL}/api/chatbot/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: lastUserMessage.text
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        message: result.response,
        isComplete: result.is_complete,
        reportGenerated: result.is_complete,
        error: result.error
      };
      
    } catch (error) {
      console.error('Backend API call failed:', error);
      throw error;
    }
  }

  /**
   * Generate final medical report
   */
  async generateReport(): Promise<MedicalReport | null> {
    if (!this.sessionId || this.conversation.length === 0) {
      return null;
    }

    const BACKEND_URL = 'http://localhost:8000';
    
    try {      
      const response = await fetch(`${BACKEND_URL}/api/chatbot/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Convert backend report format to frontend format
      const reportData = result.report_data;
      
      return {
        summary: reportData.summary || "Report generated successfully",
        symptoms: reportData.symptoms || "Not provided",
        onset: reportData.onset || "Not provided", 
        duration: reportData.duration || "Not provided",
        severity: reportData.severity || "Not provided",
        frequency: reportData.frequency || "Not provided",
        character: reportData.character || "Not provided",
        location: reportData.location || "Not provided",
        triggers_relief: reportData.triggers_relief || "Not provided",
        associated_symptoms: reportData.associated_symptoms || "Not provided",
        medical_history: reportData.medical_history || "Not provided",
        family_history: reportData.family_history || "Not provided",
        lifestyle_context: reportData.lifestyle_context || "Not provided"
      };
      
    } catch (error) {
      console.error('Report generation error:', error);
      return null;
    }
  }
}

export const chatbotService = new ChatbotService();