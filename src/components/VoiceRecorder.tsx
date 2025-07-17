import React, { useState, useRef, useCallback } from "react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  disabled = false,
  className = "",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const requestPermissions =
    useCallback(async (): Promise<MediaStream | null> => {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        });
        return stream;
      } catch (error) {
        let errorMessage = "Nu s-a putut accesa microfonul.";

        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            errorMessage =
              "Acces la microfon refuzat. Te rog să permiți accesul la microfon în setările browserului.";
          } else if (error.name === "NotFoundError") {
            errorMessage = "Nu s-a găsit niciun microfon conectat.";
          } else if (error.name === "NotSupportedError") {
            errorMessage = "Browserul nu suportă înregistrarea audio.";
          }
        }

        setPermissionError(errorMessage);
        console.error("Error accessing microphone:", error);
        return null;
      }
    }, []);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;

    setIsPreparing(true);
    const stream = await requestPermissions();

    if (!stream) {
      setIsPreparing(false);
      return;
    }

    try {
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm",
        });
        onRecordingComplete(audioBlob);

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPreparing(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log("🎤 Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      setPermissionError("Eroare la începerea înregistrării.");
      setIsPreparing(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [disabled, isRecording, onRecordingComplete, requestPermissions]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    console.log("🎤 Stopping recording");

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop recording
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setRecordingTime(0);
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (permissionError) {
    return (
      <div className={`voice-recorder-error ${className}`}>
        <div className="voice-recorder-error-message">❌ {permissionError}</div>
        <button
          onClick={() => setPermissionError(null)}
          className="voice-recorder-retry-btn"
        >
          🔄 Încearcă din nou
        </button>
      </div>
    );
  }

  return (
    <div className={`voice-recorder ${className}`}>
      {!isRecording && !isPreparing ? (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="voice-recorder-btn voice-recorder-btn--start"
          title="Apasă și ține pentru a înregistra"
        >
          🎤
        </button>
      ) : isPreparing ? (
        <button
          disabled
          className="voice-recorder-btn voice-recorder-btn--preparing"
          title="Se pregătește înregistrarea..."
        >
          ⏳
        </button>
      ) : (
        <div className="voice-recorder-active">
          <button
            onClick={stopRecording}
            className="voice-recorder-btn voice-recorder-btn--stop"
            title="Oprește înregistrarea"
          >
            ⏹️
          </button>
          <div className="voice-recorder-timer">
            <span className="voice-recorder-time">
              {formatTime(recordingTime)}
            </span>
            <div className="voice-recorder-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
