
import { simulateTranscription } from "../api/transcribe";
import { toast } from "@/hooks/use-toast";

/**
 * This is a utility to help test voice recording and transcription
 * without needing a real backend endpoint.
 */
export async function testVoiceRecording() {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    toast({
      title: "Recording Started",
      description: "Speak now. Recording will stop after 5 seconds.",
    });
    
    // Set up the MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    // Collect audio data
    mediaRecorder.addEventListener('dataavailable', event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    // When recording stops, process the audio
    mediaRecorder.addEventListener('stop', async () => {
      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
      
      // Create a blob from all the chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      toast({
        title: "Processing Audio",
        description: "Transcribing your recording...",
      });
      
      try {
        // Use our simulated transcription function
        const result = await simulateTranscription(audioBlob);
        
        toast({
          title: "Transcription Result",
          description: result.transcript,
        });
        
        // Create an audio element to play back the recording
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Add a button to the DOM to play the recording
        const playButton = document.createElement('button');
        playButton.innerText = 'Play Recording';
        playButton.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg';
        playButton.onclick = () => {
          audio.play();
        };
        
        document.body.appendChild(playButton);
        
        // Remove the button after 10 seconds
        setTimeout(() => {
          if (document.body.contains(playButton)) {
            document.body.removeChild(playButton);
          }
        }, 10000);
        
      } catch (error) {
        console.error("Error processing audio:", error);
        toast({
          title: "Transcription Error",
          description: "Failed to process the recording.",
          variant: "destructive"
        });
      }
    });
    
    // Start recording
    mediaRecorder.start();
    
    // Stop recording after 5 seconds
    setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, 5000);
    
  } catch (error) {
    console.error("Error accessing microphone:", error);
    toast({
      title: "Microphone Access Denied",
      description: "Please allow microphone access to use this feature.",
      variant: "destructive"
    });
  }
}
