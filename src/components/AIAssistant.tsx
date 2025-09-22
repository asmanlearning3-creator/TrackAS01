import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Globe, AlertTriangle } from 'lucide-react';
import { aiAssistantService, ChatMessage } from '../services/aiAssistantService';

interface AIAssistantProps {
  userRole: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userRole, userId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await aiAssistantService.getChatHistory(userId, 20);
      setMessages(history.reverse());
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: inputMessage,
      language: selectedLanguage,
      timestamp: new Date().toISOString(),
      userId,
      userRole
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAssistantService.processMessage(
        inputMessage,
        userId,
        userRole,
        { language: selectedLanguage }
      );
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: selectedLanguage === 'hi' 
          ? 'क्षमा करें, एक त्रुटि हुई है। कृपया पुनः प्रयास करें।'
          : 'Sorry, an error occurred. Please try again.',
        language: selectedLanguage,
        timestamp: new Date().toISOString(),
        userId,
        userRole
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleGreeting = () => {
    const greetings = {
      en: {
        admin: "Hello! I'm your AI assistant for TrackAS administration. How can I help you manage the system today?",
        shipper: "Hi! I'm here to help you with shipment creation, tracking, and logistics management. What do you need assistance with?",
        fleet_operator: "Welcome! I can help you manage your fleet, subscriptions, and driver assignments. How can I assist you?",
        individual_vehicle_owner: "Hello! I'm here to help you with job acceptance, earnings tracking, and vehicle management. What can I do for you?",
        customer: "Hi there! I can help you track your shipments and answer any questions you have. How can I assist you today?"
      },
      hi: {
        admin: "नमस्ते! मैं TrackAS प्रशासन के लिए आपका AI सहायक हूं। आज सिस्टम प्रबंधन में मैं आपकी कैसे मदद कर सकता हूं?",
        shipper: "नमस्ते! मैं शिपमेंट बनाने, ट्रैकिंग और लॉजिस्टिक्स प्रबंधन में आपकी मदद करने के लिए यहां हूं। आपको क्या सहायता चाहिए?",
        fleet_operator: "स्वागत है! मैं आपकी फ्लीट, सब्सक्रिप्शन और ड्राइवर असाइनमेंट प्रबंधन में मदद कर सकता हूं। मैं आपकी कैसे सहायता कर सकता हूं?",
        individual_vehicle_owner: "नमस्ते! मैं जॉब स्वीकृति, कमाई ट्रैकिंग और वाहन प्रबंधन में आपकी मदद करने के लिए यहां हूं। मैं आपके लिए क्या कर सकता हूं?",
        customer: "नमस्ते! मैं आपकी शिपमेंट ट्रैक करने और आपके सवालों का जवाब देने में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?"
      }
    };

    return greetings[selectedLanguage][userRole as keyof typeof greetings.en] || greetings.en.customer;
  };

  const getQuickActions = () => {
    const actions = {
      en: {
        admin: [
          "Show pending approvals",
          "Update commission settings",
          "View system analytics",
          "Manage fleet subscriptions"
        ],
        shipper: [
          "Create new shipment",
          "Track active shipments",
          "View pricing calculator",
          "Check payment status"
        ],
        fleet_operator: [
          "View fleet dashboard",
          "Manage subscriptions",
          "Assign drivers",
          "Check earnings"
        ],
        individual_vehicle_owner: [
          "Mark availability",
          "View available jobs",
          "Check earnings",
          "Update profile"
        ],
        customer: [
          "Track my shipment",
          "Get delivery updates",
          "Download invoice",
          "Rate delivery"
        ]
      },
      hi: {
        admin: [
          "लंबित अनुमोदन दिखाएं",
          "कमीशन सेटिंग्स अपडेट करें",
          "सिस्टम एनालिटिक्स देखें",
          "फ्लीट सब्सक्रिप्शन प्रबंधित करें"
        ],
        shipper: [
          "नया शिपमेंट बनाएं",
          "सक्रिय शिपमेंट ट्रैक करें",
          "मूल्य कैलकुलेटर देखें",
          "भुगतान स्थिति जांचें"
        ],
        fleet_operator: [
          "फ्लीट डैशबोर्ड देखें",
          "सब्सक्रिप्शन प्रबंधित करें",
          "ड्राइवर असाइन करें",
          "कमाई जांचें"
        ],
        individual_vehicle_owner: [
          "उपलब्धता चिह्नित करें",
          "उपलब्ध नौकरियां देखें",
          "कमाई जांचें",
          "प्रोफाइल अपडेट करें"
        ],
        customer: [
          "मेरा शिपमेंट ट्रैक करें",
          "डिलीवरी अपडेट प्राप्त करें",
          "इनवॉइस डाउनलोड करें",
          "डिलीवरी रेट करें"
        ]
      }
    };

    return actions[selectedLanguage][userRole as keyof typeof actions.en] || [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">TrackAS AI Assistant</h3>
              <p className="text-sm text-gray-500 capitalize">{userRole.replace('_', ' ')} Support</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-gray-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
                className="text-sm border-none bg-transparent focus:outline-none"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{getRoleGreeting()}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Quick actions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {getQuickActions().map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(action)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="h-4 w-4 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedLanguage === 'hi' ? 'अपना संदेश टाइप करें...' : 'Type your message...'}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

