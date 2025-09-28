/**
 * Test script for the chatbot service integration
 * Run this to verify the Gemini API connection works
 */
import { chatbotService } from './chatbot-service';

async function testChatbotService() {
  console.log('🧪 Testing MediSyn Chatbot Service...');
  
  try {
    // Test 1: Start a session
    console.log('\n📋 Test 1: Starting session...');
    const sessionId = await chatbotService.startSession();
    console.log('✅ Session started:', sessionId);

    // Test 2: Send a message
    console.log('\n💬 Test 2: Sending message...');
    const response = await chatbotService.sendMessage('I have been experiencing headaches for the past week');
    console.log('✅ AI Response received:', response.message.substring(0, 100) + '...');
    console.log('   Session complete:', response.isComplete);

    // Test 3: Send follow-up (only if session not complete)
    if (!response.isComplete) {
      console.log('\n💬 Test 3: Sending follow-up...');
      const followUp = await chatbotService.sendMessage('The headaches are usually in the morning and feel like pressure');
      console.log('✅ Follow-up response:', followUp.message.substring(0, 100) + '...');
    }

    console.log('\n🎉 All tests passed! Chatbot service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Tip: Make sure to set your Google Gemini API key in the chatbot service');
      } else if (error.message.includes('network')) {
        console.log('\n💡 Tip: Check your internet connection');
      } else if (error.message.includes('quota')) {
        console.log('\n💡 Tip: Check your Google API quota limits');
      }
    }
  }
}

// Export for use in development
export { testChatbotService };

// Uncomment the line below to run the test when importing this file
// testChatbotService();