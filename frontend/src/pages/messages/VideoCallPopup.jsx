import React from "react";
import { useVideoCall } from "../../../context/VideoCallContext";

const VideoCallPopup = () => {
  const {
    incomingCall,
    answerCall,
    rejectCall,
    localVideoRef,
    remoteVideoRef,
    inCall,
  } = useVideoCall();

  if (!incomingCall && !inCall) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      right: 400,
      width: 320,
      height: 400,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 8,
      zIndex: 9999,
      padding: 10
    }}>
      <h4>📹 Video Call</h4>

      {/* Nếu đang có người gọi đến */}
      {incomingCall && (
        <div>
          <p>📲 Có người gọi đến: {incomingCall.from}</p>
          <button onClick={answerCall}>✅ Nhận</button>
          <button onClick={rejectCall}>❌ Từ chối</button>
        </div>
      )}

      {/* Nếu đã đang gọi */}
      {inCall && (
        <div>
          <video ref={localVideoRef} autoPlay muted style={{ width: "100%", background: "#ddd" }} />
          <video ref={remoteVideoRef} autoPlay style={{ width: "100%", background: "#aaa", marginTop: 10 }} />
        </div>
      )}
    </div>
  );
};

export default VideoCallPopup;
