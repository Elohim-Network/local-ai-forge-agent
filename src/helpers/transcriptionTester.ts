
// Import the startAudioRecording function from our utility file
import { startAudioRecording } from "../hooks/useVoiceUtils";

/**
 * Tests voice recording capabilities in the browser
 * This helps diagnose issues with microphone access and recording
 */
export async function testVoiceRecording(): Promise<string> {
  console.log("Starting voice recording test");
  
  try {
    // First check if the MediaRecorder API is available
    if (typeof MediaRecorder === 'undefined') {
      throw new Error("MediaRecorder API is not supported in this browser. Try using Chrome or Edge.");
    }
    
    // Next check if we can access user media
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Successfully accessed microphone", stream);
    
    // Check for audio tracks
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      // Clean up stream
      stream.getTracks().forEach(track => track.stop());
      throw new Error("No audio tracks detected. Please check your microphone.");
    }
    
    console.log(`Found ${audioTracks.length} audio tracks:`, audioTracks.map(t => t.label));
    
    // Release the initial test stream
    stream.getTracks().forEach(track => track.stop());
    
    // Now try recording a sample using our utility function
    const { mediaRecorder, recordingPromise, stopRecording } = await startAudioRecording();
    console.log("MediaRecorder created successfully", mediaRecorder);
    
    // Record for 2 seconds
    setTimeout(() => {
      console.log("Stopping test recording");
      stopRecording();
    }, 2000);
    
    // Wait for the recording to complete
    const audioBlob = await recordingPromise;
    console.log("Test recording completed", { size: audioBlob.size, type: audioBlob.type });
    
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("No audio data was captured. Please check if your microphone is working properly.");
    }
    
    // Create an audio element to check if the recording worked
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    
    return "Voice recording test successful. Your microphone is working correctly.";
  } catch (error) {
    console.error("Voice recording test failed:", error);
    
    // Provide user-friendly error messages based on common issues
    if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
      throw new Error("Microphone access denied. Please allow microphone permissions in your browser settings.");
    } else if (error.name === 'NotFoundError' || error.message.includes('No devices found')) {
      throw new Error("No microphone detected. Please connect a microphone and try again.");
    } else if (error.name === 'NotReadableError' || error.message.includes('Could not start audio source')) {
      throw new Error("Could not access microphone. Your microphone might be in use by another application.");
    } else {
      throw new Error(`Microphone test failed: ${error.message || "Unknown error"}`);
    }
  }
}
