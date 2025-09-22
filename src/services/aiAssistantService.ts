import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: 'en' | 'hi';
  timestamp: string;
  userId?: string;
  userRole?: string;
  context?: any;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  language: 'en' | 'hi';
  role: 'admin' | 'shipper' | 'fleet_operator' | 'individual_vehicle_owner' | 'customer';
  category: string;
  keywords: string[];
}

export interface EscalationRule {
  id: string;
  keywords: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoEscalate: boolean;
  targetRole: 'admin';
  message: string;
}

export class AIAssistantService {
  private static instance: AIAssistantService;
  private readonly SUPPORTED_LANGUAGES = ['en', 'hi'];
  private readonly DEFAULT_LANGUAGE = 'en';

  public static getInstance(): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService();
    }
    return AIAssistantService.instance;
  }

  // Main chat interface
  async processMessage(
    message: string,
    userId: string,
    userRole: string,
    context?: any
  ): Promise<ChatMessage> {
    try {
      // Detect language
      const language = this.detectLanguage(message);
      
      // Check for escalation triggers
      const escalation = await this.checkEscalationTriggers(message, userRole);
      if (escalation) {
        return await this.handleEscalation(message, userId, userRole, escalation, language);
      }

      // Try FAQ matching first
      const faqMatch = await this.findFAQMatch(message, userRole, language);
      if (faqMatch) {
        return await this.createResponse(faqMatch.answer, language, userId, userRole, context);
      }

      // Use AI for complex queries
      const aiResponse = await this.generateAIResponse(message, userRole, language, context);
      
      return await this.createResponse(aiResponse, language, userId, userRole, context);
    } catch (error) {
      console.error('Error processing message:', error);
      return await this.createErrorResponse(userId, userRole);
    }
  }

  // Language Detection
  private detectLanguage(text: string): 'en' | 'hi' {
    // Simple language detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text) ? 'hi' : 'en';
  }

  // Escalation Detection
  private async checkEscalationTriggers(message: string, userRole: string): Promise<EscalationRule | null> {
    try {
      const { data: rules } = await supabase
        .from('escalation_rules')
        .select('*')
        .eq('target_role', 'admin');

      if (!rules) return null;

      const messageLower = message.toLowerCase();
      
      for (const rule of rules) {
        const hasKeyword = rule.keywords.some(keyword => 
          messageLower.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          return rule;
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking escalation triggers:', error);
      return null;
    }
  }

  // FAQ Matching
  private async findFAQMatch(message: string, userRole: string, language: string): Promise<FAQ | null> {
    try {
      const { data: faqs } = await supabase
        .from('faqs')
        .select('*')
        .eq('role', userRole)
        .eq('language', language);

      if (!faqs) return null;

      const messageLower = message.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      for (const faq of faqs) {
        const score = this.calculateFAQScore(messageLower, faq);
        if (score > bestScore && score > 0.3) { // Minimum 30% match
          bestScore = score;
          bestMatch = faq;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('Error finding FAQ match:', error);
      return null;
    }
  }

  private calculateFAQScore(message: string, faq: FAQ): number {
    let score = 0;
    const questionWords = faq.question.toLowerCase().split(' ');
    const answerWords = faq.answer.toLowerCase().split(' ');
    const keywordMatches = faq.keywords.filter(keyword => 
      message.includes(keyword.toLowerCase())
    ).length;

    // Keyword matches (40% weight)
    score += (keywordMatches / faq.keywords.length) * 0.4;

    // Question word matches (30% weight)
    const questionMatches = questionWords.filter(word => 
      message.includes(word) && word.length > 3
    ).length;
    score += (questionMatches / questionWords.length) * 0.3;

    // Answer word matches (30% weight)
    const answerMatches = answerWords.filter(word => 
      message.includes(word) && word.length > 3
    ).length;
    score += (answerMatches / answerWords.length) * 0.3;

    return score;
  }

  // AI Response Generation
  private async generateAIResponse(
    message: string, 
    userRole: string, 
    language: string, 
    context?: any
  ): Promise<string> {
    try {
      // Get role-specific context
      const roleContext = this.getRoleContext(userRole);
      
      // Prepare prompt for AI
      const prompt = this.buildAIPrompt(message, userRole, language, roleContext, context);
      
      // Call AI service (OpenAI, Claude, etc.)
      const response = await this.callAIService(prompt, language);
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userRole, language);
    }
  }

  private getRoleContext(userRole: string): string {
    const contexts = {
      admin: 'You are an AI assistant for TrackAS administrators. Help with system management, approvals, analytics, and oversight.',
      shipper: 'You are an AI assistant for logistics companies (shippers). Help with shipment creation, tracking, pricing, and fleet management.',
      fleet_operator: 'You are an AI assistant for fleet operators. Help with fleet management, subscription management, and driver assignments.',
      individual_vehicle_owner: 'You are an AI assistant for individual vehicle owners. Help with job acceptance, earnings, and vehicle management.',
      customer: 'You are an AI assistant for customers. Help with shipment tracking, delivery updates, and general inquiries.'
    };
    
    return contexts[userRole as keyof typeof contexts] || contexts.customer;
  }

  private buildAIPrompt(
    message: string, 
    userRole: string, 
    language: string, 
    roleContext: string, 
    context?: any
  ): string {
    let prompt = `${roleContext}\n\n`;
    
    if (language === 'hi') {
      prompt += 'Please respond in Hindi (हिंदी).\n\n';
    } else {
      prompt += 'Please respond in English.\n\n';
    }

    prompt += `User Message: ${message}\n\n`;
    
    if (context) {
      prompt += `Context: ${JSON.stringify(context)}\n\n`;
    }

    prompt += 'Provide a helpful, accurate response. If you need more information, ask specific questions.';
    
    return prompt;
  }

  private async callAIService(prompt: string, language: string): Promise<string> {
    // Mock AI service call - in production, integrate with OpenAI, Claude, etc.
    const responses = {
      en: {
        greeting: "Hello! I'm TrackAS AI Assistant. How can I help you today?",
        shipment: "I can help you with shipment creation, tracking, and management. What specific information do you need?",
        payment: "For payment-related queries, I can help you understand our commission structure, escrow system, and billing processes.",
        technical: "I can assist with technical issues. Please describe the problem you're experiencing.",
        default: "I understand you need help. Could you please provide more details about your specific question or issue?"
      },
      hi: {
        greeting: "नमस्ते! मैं TrackAS AI Assistant हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        shipment: "मैं आपकी शिपमेंट बनाने, ट्रैक करने और प्रबंधन में मदद कर सकता हूं। आपको क्या जानकारी चाहिए?",
        payment: "भुगतान से संबंधित प्रश्नों के लिए, मैं आपकी कमीशन संरचना, एस्क्रो सिस्टम और बिलिंग प्रक्रियाओं को समझने में मदद कर सकता हूं।",
        technical: "मैं तकनीकी समस्याओं में सहायता कर सकता हूं। कृपया बताएं कि आपको क्या समस्या आ रही है।",
        default: "मैं समझता हूं कि आपको मदद चाहिए। कृपया अपने विशिष्ट प्रश्न या समस्या के बारे में अधिक विवरण दें।"
      }
    };

    // Simple keyword-based response selection
    const messageLower = prompt.toLowerCase();
    const langResponses = responses[language as keyof typeof responses];
    
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('नमस्ते')) {
      return langResponses.greeting;
    } else if (messageLower.includes('shipment') || messageLower.includes('शिपमेंट')) {
      return langResponses.shipment;
    } else if (messageLower.includes('payment') || messageLower.includes('भुगतान')) {
      return langResponses.payment;
    } else if (messageLower.includes('error') || messageLower.includes('problem') || messageLower.includes('समस्या')) {
      return langResponses.technical;
    } else {
      return langResponses.default;
    }
  }

  // Escalation Handling
  private async handleEscalation(
    message: string,
    userId: string,
    userRole: string,
    escalation: EscalationRule,
    language: string
  ): Promise<ChatMessage> {
    // Create escalation ticket
    await this.createEscalationTicket(userId, userRole, message, escalation);
    
    // Notify admin
    await this.notifyAdmin(escalation, message, userId, userRole);
    
    const escalationMessage = language === 'hi' 
      ? `आपकी समस्या को प्रशासक को भेज दिया गया है। टिकट #${escalation.id}। आपको जल्द ही सहायता मिलेगी।`
      : `Your issue has been escalated to an administrator. Ticket #${escalation.id}. You will receive assistance shortly.`;
    
    return await this.createResponse(escalationMessage, language, userId, userRole);
  }

  private async createEscalationTicket(
    userId: string,
    userRole: string,
    message: string,
    escalation: EscalationRule
  ): Promise<void> {
    await supabase
      .from('escalation_tickets')
      .insert({
        user_id: userId,
        user_role: userRole,
        message,
        severity: escalation.severity,
        status: 'open',
        escalation_rule_id: escalation.id
      });
  }

  private async notifyAdmin(
    escalation: EscalationRule,
    message: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    await supabase
      .from('notifications')
      .insert({
        user_id: 'admin',
        user_type: 'admin',
        type: escalation.severity === 'critical' ? 'error' : 'warning',
        title: 'AI Escalation',
        message: `Escalated from ${userRole}: ${message}`,
        data: { userId, userRole, escalation }
      });
  }

  // Response Creation
  private async createResponse(
    content: string,
    language: string,
    userId: string,
    userRole: string,
    context?: any
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content,
      language,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      context
    };

    // Store in database
    await this.storeMessage(message);
    
    return message;
  }

  private async createErrorResponse(userId: string, userRole: string): Promise<ChatMessage> {
    return {
      id: this.generateId(),
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again or contact support.',
      language: 'en',
      timestamp: new Date().toISOString(),
      userId,
      userRole
    };
  }

  private getFallbackResponse(userRole: string, language: string): string {
    const responses = {
      en: "I'm here to help! Could you please rephrase your question or provide more details?",
      hi: "मैं मदद के लिए यहां हूं! कृपया अपना प्रश्न दोबारा कहें या अधिक विवरण दें।"
    };
    
    return responses[language as keyof typeof responses];
  }

  // Message Storage
  private async storeMessage(message: ChatMessage): Promise<void> {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          user_id: message.userId,
          user_role: message.userRole,
          role: message.role,
          content: message.content,
          language: message.language,
          context: message.context,
          created_at: message.timestamp
        });
    } catch (error) {
      console.error('Error storing message:', error);
    }
  }

  // FAQ Management
  async createFAQ(faq: Omit<FAQ, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('faqs')
        .insert({
          question: faq.question,
          answer: faq.answer,
          language: faq.language,
          role: faq.role,
          category: faq.category,
          keywords: faq.keywords
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      return false;
    }
  }

  async getFAQs(role: string, language: string): Promise<FAQ[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('role', role)
        .eq('language', language)
        .order('category');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  // Chat History
  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Utility Methods
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // WhatsApp Integration
  async sendWhatsAppMessage(phoneNumber: string, message: string, language: string): Promise<boolean> {
    try {
      // Integration with WhatsApp Business API
      console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // SMS Integration
  async sendSMS(phoneNumber: string, message: string, language: string): Promise<boolean> {
    try {
      // Integration with SMS service provider
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }
}

export const aiAssistantService = AIAssistantService.getInstance();
