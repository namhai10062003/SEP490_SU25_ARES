// src/components/VideoPlayer.jsx
import React, { useEffect, useRef, useState } from "react";
import { useVideoCall } from "../../../../context/VideoCallContext";

const VideoPlayer = () => {
  const {
    localStream,
    remoteStream,
    callActive,
    endCall,
  } = useVideoCall();

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);

  // Set stream vào video
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Mic toggle
  const toggleMic = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  // Cam toggle
  const toggleCam = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
    }
  };

  // 🔊 Phân tích âm thanh local
  useEffect(() => {
    if (!localStream) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const mic = audioCtx.createMediaStreamSource(localStream);
    mic.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setLocalSpeaking(volume > 10); // Ngưỡng tùy chỉnh
      requestAnimationFrame(detectSpeaking);
    };
    detectSpeaking();

    return () => {
      mic.disconnect();
      analyser.disconnect();
      audioCtx.close();
    };
  }, [localStream]);

  // 🔊 Phân tích âm thanh remote
  useEffect(() => {
    if (!remoteStream) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const remoteAudio = audioCtx.createMediaStreamSource(remoteStream);
    remoteAudio.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setRemoteSpeaking(volume > 10);
      requestAnimationFrame(detectSpeaking);
    };
    detectSpeaking();

    return () => {
      remoteAudio.disconnect();
      analyser.disconnect();
      audioCtx.close();
    };
  }, [remoteStream]);

  if (!localStream) return null;

  return (
    <div style={styles.container}>
      {/* Local Video */}
      <video
ref={localRef}
        autoPlay
        muted
        playsInline
        style={{
          ...styles.localVideo,
          borderColor: localSpeaking ? "#ffc107" : "#28a745",
        }}
      />

      {/* Remote Video */}
      {callActive && (
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          style={{
            ...styles.remoteVideo,
            borderColor: remoteSpeaking ? "#ffc107" : "#007bff",
          }}
        />
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <button onClick={toggleMic} style={styles.button}>
          {micEnabled ? "🔊 Mic On" : "🔇 Mic Off"}
        </button>
        <button onClick={toggleCam} style={styles.button}>
          {camEnabled ? "🎥 Cam On" : "📷 Cam Off"}
        </button>
        {callActive && (
          <button onClick={endCall} style={styles.endButton}>
            ❌ Kết thúc
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: 20,
    left: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    zIndex: 9999,
  },
  localVideo: {
    width: "160px",
    height: "120px",
    borderRadius: "10px",
    border: "3px solid",
    backgroundColor: "#000",
  },
  remoteVideo: {
    width: "280px",
    height: "210px",
    borderRadius: "10px",
    border: "3px solid",
    backgroundColor: "#000",
  },
  controls: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  button: {
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#f1f1f1",
    border: "1px solid #ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  endButton: {
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default VideoPlayer;