// Define types for Web Speech API since they might not be in all TS environments
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

let recognition: any = null;

export const isSpeechSupported = (): boolean => {
  const w = window as unknown as IWindow;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
};

export const startListening = (
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
) => {
  const w = window as unknown as IWindow;
  const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Browser not supported");
    return;
  }

  // Prevent multiple instances
  if (recognition) {
    recognition.abort();
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES'; // Set specifically to Spanish
  recognition.interimResults = false; // We only want the final result
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech error", event.error);
    if (event.error === 'no-speech') {
       // Just ignore no-speech and let user try again
       return;
    }
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error(e);
    onError("Microphone access failed");
  }
};

export const stopListening = () => {
  if (recognition) {
    recognition.stop();
  }
};

// Helper to compare spoken text with target word (fuzzy matching)
export const checkPronunciation = (target: string, spoken: string): boolean => {
  const normalize = (str: string) => 
    str.toLowerCase()
       .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "") // Remove punctuation
       .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents (optional, but stricter is better for learning. Let's keep accents significant for Spanish)
       .trim();

  // For strict Spanish learning, we WANT to keep accents significant usually, 
  // but speech-to-text might be finicky. 
  // Let's do a case-insensitive, punctuation-stripped comparison.
  const nTarget = target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "").trim();
  const nSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "").trim();

  return nTarget === nSpoken;
};