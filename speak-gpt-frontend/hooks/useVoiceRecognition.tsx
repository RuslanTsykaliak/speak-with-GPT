import Voice, {
    SpeechErrorEvent,
    SpeechResultsEvent,
} from "@react-native-voice/voice";
import { useCallback, useEffect, useState } from "react";

// Define the interface for the state
interface IState {
    recognized: string;
    pitch: string;
    error: string;
    end: string;
    started: string;
    results: string[];
    partialResults: string[];
    isRecording: boolean;
}

// Custom hook for voice recognition functionality
export const useVoiceRecognition = () => {
    const [state, setState] = useState<IState>({
        recognized: "",
        pitch: "",
        error: "",
        end: "",
        started: "",
        results: [],
        partialResults: [],
        isRecording: false,
    })

    // Reset the state to initial values
    const resetState = useCallback(() => {
        setState({
            recognized: "",
            pitch: "",
            error: "",
            started: "",
            results: [],
            partialResults: [],
            end: "",
            isRecording: false,
        });
    }, [setState]);

    // Start the voice recognition process
    const startRecognizing = useCallback(async () => {
        resetState();
        try {
            await Voice.start("en-US"); // Start voice recognition with the specified language
        } catch (e) {
            console.error(e);
        }
    }, [resetState])

    // Stop the voice recognition process
    const stopRecognizing = useCallback(async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }, [])

    // Cancel the ongoing voice recognition process
    const cancelRecognizing = useCallback(async () => {
        try {
            await Voice.cancel();
        } catch (e) {
            console.error(e);
        }
    }, [])

    // Destroy the voice recognizer instance and reset the state
    const destroyRecognizer = useCallback(async () => {
        try {
            await Voice.destroy();
        } catch (e) {
            console.error(e);
        }
        resetState();
    }, [resetState])

    // Set up event listeners and handle events
    useEffect(() => {
        // Event handler for when speech starts
        Voice.onSpeechStart = (e: any) => {
            setState((prevState) => ({
                ...prevState,
                started: "√",
                isRecording: true,
            }))
        }

        // Event handler for when speech is recognized
        Voice.onSpeechRecognized = () => {
            setState((prevState) => ({ ...prevState, recognized: "√", }))
        }

        // Event handler for when speech ends
        Voice.onSpeechEnd = (e: any) => {
            setState((prevState) => ({ ...prevState, end: "√", isRecording: false }))
        }

        // Event handler for speech recognition errors
        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            setState((prevState) => ({
                ...prevState,
                error: JSON.stringify(e.error),
                isRecording: false,
            }))
        }

        // Event handler for speech recognition results
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value) {
                setState((prevState) => ({ ...prevState, results: e.value! }))
            }
        }

        // Event handler for partial speech recognition results
        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value) {
                setState((prevState) => ({ ...prevState, partialResults: e.value! }))
            }
        }

        // Event handler for changes in speech volume
        Voice.onSpeechVolumeChanged = (e: any) => {
            setState((prevState) => ({ ...prevState, pitch: e.value }))
        }

        // Clean up event listeners when the component unmounts
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, [])

    // Return the relevant functions and state for external usage
    return {
        state,
        setState,
        resetState,
        startRecognizing,
        stopRecognizing,
        cancelRecognizing,
        destroyRecognizer,
    }
}
