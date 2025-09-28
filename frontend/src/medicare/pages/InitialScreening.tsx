import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare,
  Mic,
  Send,
  Heart,
  ArrowLeft,
  Bot,
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatbotService, ChatMessage as ApiChatMessage } from "@/lib/chatbot-service";
import { getCurrentSession } from "@/lib/auth";

interface ChatMessage {
  id: string;
  sender: 'patient' | 'ai';
  content: string;
  timestamp: Date;
}

const InitialScreening = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and user info
  useEffect(() => {
    const session = getCurrentSession();
    setCurrentUser(session);
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await chatbotService.startSession();
      
      const initialMessage: ChatMessage = {
        id: "1",
        sender: "ai",
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      setIsSessionActive(true);
    } catch (error) {
      setError("Failed to start medical screening. Please try again.");
      console.error("Chat initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isSessionActive || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setError("");

    // Add user message to UI
    const patientMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "patient",
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, patientMessage]);

    try {
      // Send message to AI and get response
      const response = await chatbotService.sendMessage(userMessage);
      
      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Check if session is complete
      if (response.isComplete) {
        setSessionComplete(true);
        setIsSessionActive(false);
        
        // Automatically generate report when session completes
        try {
          console.log("Session completed, generating report...");
          const report = await chatbotService.generateReport();
          if (report) {
            console.log("Report generated successfully:", report);
            // Add success message to chat
            const reportMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              sender: "ai",
              content: "✅ Medical report has been generated and saved locally. You can now return to your dashboard.",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, reportMessage]);
          }
        } catch (reportError) {
          console.error("Report generation failed:", reportError);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            sender: "ai", 
            content: "⚠️ Session completed but report generation encountered an issue. Please contact support if needed.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }

      if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      setError("Failed to get response. Please try again.");
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recording functionality would go here
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Medical Screening</h1>
                  <p className="text-muted-foreground">
                    {currentUser?.userName ? `Hello ${currentUser.userName}` : 'Pre-appointment consultation'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {sessionComplete ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Screening Complete
                </Badge>
              ) : isSessionActive ? (
                <Badge className="bg-blue-100 text-blue-800">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Initializing
                </Badge>
              )}
              <Badge className="bg-secondary/10 text-secondary">
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-0 shadow-card h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>AI Health Assistant</span>
              <Badge className="bg-primary/10 text-primary text-xs">Secure & Private</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl ${
                      message.sender === 'patient' 
                        ? 'bg-primary text-white ml-auto' 
                        : 'bg-muted/50 text-foreground'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.sender === 'patient' && (
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">S</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 text-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Error: {error}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Completion Notice */}
            {sessionComplete && (
              <div className="border-t pt-4 mb-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Screening Complete!</span>
                  </div>
                  <p className="text-sm">
                    Thank you for providing your health information. Your responses have been recorded
                    and will be available to Dr. Mitchell during your appointment.
                  </p>
                  <Button 
                    className="mt-3 w-full"
                    onClick={() => navigate('/patient-dashboard')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={`border-t pt-4 ${sessionComplete ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
                  disabled={sessionComplete || isLoading}
                  className={`${
                    isListening 
                      ? 'border-red-500 text-red-500 bg-red-50' 
                      : 'border-secondary/20 text-secondary hover:bg-secondary/5'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={sessionComplete ? "Screening completed" : "Type your response or click the mic to speak..."}
                    disabled={sessionComplete}
                    className="pr-12"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading || sessionComplete}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary-dark"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Your responses help Dr. Mitchell prepare for your visit
                </p>
                <p>
                  {isListening ? (
                    <span className="text-red-600 animate-pulse">● Listening...</span>
                  ) : (
                    "Press Enter to send"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default InitialScreening;