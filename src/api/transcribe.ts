
// This would be a server-side file in a real backend
// For testing/demo purposes, we'll create a simulated endpoint

/**
 * This is a simulated transcription endpoint
 * In a real application, this would be a server-side API that:
 * 1. Receives the audio file
 * 2. Uses a service like Whisper API or another STT service
 * 3. Returns the transcription result
 * 
 * To implement a real endpoint, you would need to:
 * - Set up a Node.js server (Express, Next.js API, etc.)
 * - Integrate with an STT service
 * - Handle authentication, rate limiting, etc.
 */

// For demo purposes, this function simulates what the backend would do
export async function simulateTranscription(audioBlob: Blob): Promise<{transcript: string}> {
  console.log("Simulating transcription of audio blob:", { 
    size: audioBlob.size, 
    type: audioBlob.type 
  });
  
  // Always simulate a successful transcription for testing purposes
  // In a real implementation, you would check the blob validity
  
  // For testing, we'll return simulated responses very quickly (100-300ms)
  return new Promise((resolve) => {
    // Generate a random response time between 100ms and 300ms
    const responseTime = Math.floor(Math.random() * 200) + 100;
    
    setTimeout(() => {
      // More varied and conversational responses
      const responses = [
        "Hello, how can I help you today?",
        "I'm looking for information about your AI assistant.",
        "Can you explain how voice recognition works here?",
        "I'd like to create a new project.",
        "What features are available?",
        "Could you show me how to use the voice chat?",
        "Tell me about the voice options.",
        "How do I connect my own voice model?",
        "What kind of AI models do you support?",
        "Is there a way to customize the voice responses?",
        "Can you help me troubleshoot the microphone?",
        "I need assistance with voice recording.",
        "Are there any voice customization options?",
        "How do I upload my own voice sample?",
        "What's the difference between the voice models?",
        "Can I export my conversations?",
        "How secure is the voice processing?",
        "Is there an API available?",
        "Does this work on mobile devices?",
        "What's new in the latest update?"
      ];
      
      // For testing purposes, always return a valid response
      // In real implementation, you would actually process the audio blob
      
      // Use a simplified random selection
      const index = Math.floor(Math.random() * responses.length);
      resolve({
        transcript: responses[index]
      });
    }, responseTime);
  });
}
