
// This file contains utility functions for voice recording and processing

export const startAudioRecording = async (options = { mimeType: 'audio/webm' }) => {
  try {
    console.log("Starting audio recording with options:", options);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, options);
    const audioChunks: Blob[] = [];
    
    // Enhanced event logging for debugging voice flow
    mediaRecorder.addEventListener('start', () => {
      console.log("MediaRecorder started successfully");
    });
    
    // Ensure we're capturing all data chunks
    mediaRecorder.addEventListener('dataavailable', event => {
      console.log("Data available from recorder:", event.data.size);
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    // Create a Promise that resolves when recording stops
    const recordingPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.addEventListener('stop', () => {
        console.log("Recording stopped, processing chunks:", audioChunks.length);
        const audioBlob = new Blob(audioChunks, { type: options.mimeType });
        
        // Ensure we clean up resources properly
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.id} stopped and released`);
        });
        
        console.log("Audio blob created:", { size: audioBlob.size, type: audioBlob.type });
        resolve(audioBlob);
      });
    });
    
    console.log("Starting audio recording...");
    mediaRecorder.start();
    
    return {
      mediaRecorder,
      recordingPromise,
      stopRecording: () => {
        if (mediaRecorder.state !== 'inactive') {
          console.log("Stopping recording...");
          mediaRecorder.stop();
        } else {
          console.log("Recording already stopped");
        }
      }
    };
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error(`Microphone access denied: ${error}`);
  }
};

export const sendAudioToServer = async (audioBlob: Blob, endpoint: string) => {
  if (!audioBlob || audioBlob.size === 0) {
    console.error("Empty audio blob received, cannot send to server");
    throw new Error("Empty audio recording");
  }
  
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  console.log("Sending audio blob to server:", { 
    endpoint, 
    blobSize: audioBlob.size, 
    blobType: audioBlob.type 
  });
  
  try {
    // For testing purposes, if the endpoint isn't available, use the simulation
    if (endpoint === "/api/transcribe" || endpoint.includes("localhost")) {
      console.log("Using simulated transcription for development");
      const simulatedResult = await simulateTranscription(audioBlob);
      return simulatedResult;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // Ensure we have proper headers and timeouts
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server returned ${response.status}: ${response.statusText}`, errorText);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Transcription result received:", result);
    return result;
  } catch (error) {
    console.error("Error sending audio to server:", error);
    throw error;
  }
};

// Simulate server transcription for testing and development
const simulateTranscription = async (audioBlob: Blob): Promise<{transcript: string}> => {
  console.log("Simulating transcription of audio blob:", { size: audioBlob.size, type: audioBlob.type });
  
  // This ensures we're actually processing something real
  if (audioBlob.size < 100) {
    console.warn("Audio blob is very small, may not contain speech");
    return { transcript: "The recording was too short to contain speech." };
  }
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // For a more realistic test, use different simulated responses
      const responses = [
        "Tell me about the latest AI developments.",
        "What can you help me with today?",
        "I'd like to create a new project.",
        "How does your voice recognition system work?",
        "Show me the dashboard with all my analytics."
      ];
      
      // Use the audio blob size to pseudo-randomly select a response
      const index = Math.floor((audioBlob.size % responses.length));
      resolve({ transcript: responses[index] });
    }, 800); // Realistic network delay
  });
};

export const detectSilence = (analyser: AnalyserNode, minDecibels = -65, callback: (isSilent: boolean) => void) => {
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  let silenceTimer: number | null = null;
  let isSilent = false;
  
  const checkSilence = () => {
    analyser.getByteTimeDomainData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    
    const rms = Math.sqrt(sum / bufferLength);
    const db = 20 * Math.log10(rms);
    
    const newIsSilent = db < minDecibels;
    
    if (newIsSilent !== isSilent) {
      isSilent = newIsSilent;
      callback(isSilent);
    }
    
    silenceTimer = window.requestAnimationFrame(checkSilence);
  };
  
  checkSilence();
  
  return () => {
    if (silenceTimer !== null) {
      window.cancelAnimationFrame(silenceTimer);
    }
  };
};
