import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare,
  Mic,
  Send,
  Heart,
  ArrowLeft,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  sender: 'patient' | 'ai';
  content: string;
  timestamp: Date;
}

const InitialScreening = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      content: "Hello Sarah! I'm here to help prepare for your upcoming appointment with Dr. Mitchell. I'll ask you a few questions about your symptoms so the doctor can better understand what you're experiencing. Are you ready to begin?",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiResponses = [
    "Thank you for that information. Can you tell me when you first noticed the chest pain? Was it gradual or did it start suddenly?",
    "I understand. On a scale of 1 to 10, how would you rate the pain intensity at its worst?",
    "That's helpful to know. Does the pain get worse with physical activity or does it happen when you're resting too?",
    "I see. Have you noticed any other symptoms along with the chest pain, such as shortness of breath, nausea, or dizziness?",
    "Thank you for sharing all this information. Based on what you've told me, I'll make sure Dr. Mitchell has all these details before your appointment. Is there anything else you'd like to mention about your symptoms?",
    "Perfect! I've recorded all your information for Dr. Mitchell. She'll be well-prepared to discuss your symptoms and develop a treatment plan. You can return to your dashboard now, and I'll see you for your appointment soon!"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add patient message
    const patientMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "patient",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, patientMessage]);
    setInputValue("");

    // Simulate AI response after a delay
    setTimeout(() => {
      const responseIndex = Math.min(messages.length - 1, aiResponses.length - 1);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai", 
        content: aiResponses[responseIndex],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
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
                  <h1 className="text-2xl font-bold text-foreground">Initial Screening</h1>
                  <p className="text-muted-foreground">Pre-appointment consultation</p>
                </div>
              </div>
            </div>
            
            <Badge className="bg-secondary/10 text-secondary">
              Dr. Mitchell - 2:30 PM
            </Badge>
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
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
                    placeholder="Type your response or click the mic to speak..."
                    className="pr-12"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary-dark"
                  >
                    <Send className="w-3 h-3" />
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