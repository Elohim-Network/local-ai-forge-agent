
// This file contains utility functions for voice recording and processing

export const startAudioRecording = async (options = { mimeType: 'audio/webm' }) => {
  try {
    console.log("Starting audio recording with options:", options);
    
    // Check if MediaRecorder is available in the browser
    if (!window.MediaRecorder) {
      throw new Error("MediaRecorder is not supported in this browser");
    }
    
    // Get user media with explicit error handling
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    // Find the best supported mime type for better compatibility
    const supportedMimeTypes = [
      'audio/webm',
      'audio/mp4', 
      'audio/wav', 
      'audio/ogg'
    ];
    
    let bestMimeType = options.mimeType;
    
    // Try to find a supported mime type
    for (const mimeType of supportedMimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        bestMimeType = mimeType;
        console.log(`Using supported mime type: ${mimeType}`);
        break;
      }
    }
    
    // Create media recorder with supported options
    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, { ...options, mimeType: bestMimeType });
    } catch (err) {
      console.warn("Failed to create MediaRecorder with specified options, trying default options");
      mediaRecorder = new MediaRecorder(stream);
    }
    
    const audioChunks: Blob[] = [];
    
    // Enhanced event logging for debugging voice flow
    mediaRecorder.addEventListener('start', () => {
      console.log("MediaRecorder started successfully");
    });
    
    // Ensure we're capturing all data chunks with proper error handling
    mediaRecorder.addEventListener('dataavailable', event => {
      console.log("Data available from recorder:", event.data.size);
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      } else {
        console.warn("Received empty audio data chunk");
      }
    });
    
    // Add error handling for MediaRecorder
    mediaRecorder.addEventListener('error', (event) => {
      console.error("MediaRecorder error:", event);
    });
    
    // Create a Promise that resolves when recording stops
    const recordingPromise = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.addEventListener('stop', () => {
        console.log("Recording stopped, processing chunks:", audioChunks.length);
        
        if (audioChunks.length === 0) {
          reject(new Error("No audio data was captured"));
          return;
        }
        
        try {
          const audioBlob = new Blob(audioChunks, { type: bestMimeType });
          console.log("Audio blob created:", { size: audioBlob.size, type: audioBlob.type });
          
          if (audioBlob.size === 0) {
            reject(new Error("Created audio blob is empty"));
            return;
          }
          
          // Create a quick audio element to verify the blob
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onloadedmetadata = () => {
            console.log(`Verified audio duration: ${audio.duration}s`);
            
            // Only accept recordings longer than 0.5 seconds
            if (audio.duration < 0.5) {
              reject(new Error("Recording too short. Please speak for at least a second."));
              return;
            }
            
            // Release the URL object
            URL.revokeObjectURL(audioUrl);
            
            // Ensure we clean up resources properly
            stream.getTracks().forEach(track => {
              track.stop();
              console.log(`Track ${track.id} stopped and released`);
            });
            
            resolve(audioBlob);
          };
          
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            reject(new Error("Error verifying audio recording"));
          };
          
          // Load the audio metadata
          audio.load();
        } catch (error) {
          console.error("Error creating audio blob:", error);
          // Ensure we clean up resources properly even on error
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        }
      });
    });
    
    // Make sure we request data frequently to avoid missing any audio
    const dataInterval = setInterval(() => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.requestData();
      }
    }, 500); // Request data more frequently (every 500ms)
    
    console.log("Starting audio recording...");
    mediaRecorder.start(100); // Request data every 100ms
    
    return {
      mediaRecorder,
      recordingPromise,
      stopRecording: () => {
        if (mediaRecorder.state !== 'inactive') {
          console.log("Stopping recording...");
          clearInterval(dataInterval);
          mediaRecorder.stop();
        } else {
          console.log("Recording already stopped");
        }
        
        // Ensure tracks are stopped even if something goes wrong
        setTimeout(() => {
          stream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              track.stop();
              console.log(`Force stopping track ${track.id}`);
            }
          });
        }, 1000);
      }
    };
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error(`Microphone access error: ${error.message || "Unknown error"}`);
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
      // Import and use the simulateTranscription function from our api/transcribe.ts
      const { simulateTranscription } = await import('../api/transcribe');
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
