"use client";

import { useState, useRef } from "react";

interface VoiceControlsProps {
  onTranscript?: (text: string) => void;
  textToSpeak?: string;
}

export default function VoiceControls({ onTranscript, textToSpeak }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceRecognition = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Start listening
    // Check for Web Speech API support
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true; // Keep listening until stopped
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const speakText = () => {
    if (!textToSpeak) return;

    // Check for Web Speech API support
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      setIsSupported(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice-to-Text */}
      {onTranscript && (
        <button
          type="button"
          onClick={toggleVoiceRecognition}
          disabled={!isSupported}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-all border-2
            ${
              isListening
                ? "bg-red-100 border-red-400 text-red-900 animate-pulse"
                : "bg-white border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-400"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isListening ? "Click to stop dictation" : "Voice to text - Dictate your post"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            {isListening ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            )}
          </svg>
          {isListening ? "⏹️ Stop" : "🎙️ Dictate"}
        </button>
      )}

      {/* Text-to-Speech */}
      {textToSpeak && (
        <button
          type="button"
          onClick={isSpeaking ? stopSpeaking : speakText}
          disabled={!isSupported}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-all border-2
            ${
              isSpeaking
                ? "bg-amber-100 border-amber-400 text-amber-900"
                : "bg-white border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-400"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Text to speech - Listen to this post"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            {isSpeaking ? (
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            ) : (
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
            )}
          </svg>
          {isSpeaking ? "🔊 Stop" : "🔊 Listen"}
        </button>
      )}
    </div>
  );
}