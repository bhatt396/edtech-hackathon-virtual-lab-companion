import { useState, useEffect, useCallback } from 'react';

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);
        }
    }, []);

    const speak = useCallback((text: string, config?: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void }) => {
        if (!isSupported) return;

        // Cancel any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (config) {
            if (config.rate) utterance.rate = config.rate;
            if (config.pitch) utterance.pitch = config.pitch;
            if (config.volume) utterance.volume = config.volume;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (config?.onEnd) config.onEnd();
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const cancel = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSupported]);

    return { speak, cancel, isSpeaking, isSupported };
}
