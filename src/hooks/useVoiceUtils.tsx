
// This file contains utility functions for voice recording and processing

export const startAudioRecording = async (options = { mimeType: 'audio/webm' }) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, options);
    const audioChunks: Blob[] = [];
    
    mediaRecorder.addEventListener('dataavailable', event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    const recordingPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: options.mimeType });
        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
        resolve(audioBlob);
      });
    });
    
    mediaRecorder.start();
    console.log("Audio recording started");
    
    return {
      mediaRecorder,
      recordingPromise,
      stopRecording: () => {
        if (mediaRecorder.state !== 'inactive') {
          console.log("Stopping audio recording");
          mediaRecorder.stop();
        }
      }
    };
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error(`Microphone access denied: ${error}`);
  }
};

export const sendAudioToServer = async (audioBlob: Blob, endpoint: string) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  console.log("Sending audio blob to server:", { 
    endpoint, 
    blobSize: audioBlob.size, 
    blobType: audioBlob.type 
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
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
