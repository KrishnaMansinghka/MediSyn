import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send,
  Bot,
  User,
  Stethoscope,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'patient' | 'ai';
  timestamp: Date;
}

const ChartPrepIntake = () => {
  const { appointmentId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI health assistant. I'm here to help prepare for your upcoming appointment with Dr. Mitchell. This conversation will help your doctor understand your concerns before you arrive, making your visit more efficient and focused on your care.",
      sender: "ai",
      timestamp: new Date()
    },
    {
      id: "2", 
      content: "Can you tell me what brings you in for this appointment today? What symptoms or concerns would you like to discuss?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "patient",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Thank you for sharing that. Can you tell me when this started and how it has progressed?",
        "I understand. Have you experienced this before, or is this the first time?",
        "That's helpful information. Are there any other symptoms you've noticed?",
        "Good to know. On a scale of 1-10, how would you rate your discomfort?",
        "Thank you for providing all this information. Let me ask a few more questions to complete your pre-visit preparation...",
        "Perfect! I have all the information I need. Your responses have been recorded and will be reviewed by Dr. Mitchell before your appointment. You can expect a more focused and efficient visit. See you soon!"
      ];

      const response = aiResponses[Math.min(messages.length - 1, aiResponses.length - 1)];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Complete intake after final message
      if (messages.length >= 8) {
        setTimeout(() => setIsCompleted(true), 2000);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Intake Complete!
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Thank you for completing your pre-visit intake. Dr. Mitchell will review your responses before your appointment, ensuring a more focused and efficient visit.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-accent" />
                  <span className="font-medium text-accent">Your Appointment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tomorrow, 9:00 AM with Dr. Sarah Mitchell
                </p>
              </div>

              <Link to="/medicare/patient-dashboard">
                <Button className="w-full bg-gradient-medical hover:opacity-90 shadow-medical">
                  Return to Patient Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50 shadow-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/medicare/patient-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Portal
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">ChartPrep AI</span>
                  <div className="text-xs text-muted-foreground">Pre-visit Intake</div>
                </div>
                
              </div>
            </div>

            <Badge className="bg-accent/10 text-accent border-accent/20">
              Appointment: Tomorrow 9:00 AM
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="h-[calc(100vh-200px)] border-0 shadow-card flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>Pre-Visit Health Assessment</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    message.sender === 'patient' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'patient' 
                        ? 'bg-gradient-medical' 
                        : 'bg-accent'
                    }`}>
                      {message.sender === 'patient' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'patient'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border shadow-sm'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'patient' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-background border shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-6">
              <div className="flex items-center space-x-4">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response here..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-gradient-medical hover:opacity-90 shadow-medical"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your responses are secure and HIPAA compliant. Press Enter to send.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartPrepIntake;