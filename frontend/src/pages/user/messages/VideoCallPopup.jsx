import React from "react";
import { useVideoCall } from "../../../../context/VideoCallContext";

const VideoCallPopup = () => {
  const {
    incomingCall,
    answerCall,
    rejectCall,
    cancelOutgoingCall,
    callerInfo,
    isCalling,
    callActive,
  } = useVideoCall();

  if (callActive) return null; // ✅ Khi đang trong call thì không hiển thị popup nữa
  if (!incomingCall && !isCalling) return null;

  return (
    <div style={styles.popup}>
      <h4 style={styles.header}>📹 Video Call</h4>

      {/* 👉 Gọi đi */}
      {isCalling && !incomingCall && (
        <>
          <p style={styles.caller}>📞 Đang gọi người dùng...</p>
          <div style={styles.actions}>
            <button onClick={cancelOutgoingCall} style={styles.reject}>
              ❌ Huỷ cuộc gọi
            </button>
          </div>
        </>
      )}

      {/* 👉 Có cuộc gọi đến */}
      {incomingCall && (
        <>
          <p style={styles.caller}>
            📲 Cuộc gọi từ: <b>{callerInfo?.name || incomingCall?.peer || "Người lạ"}</b>
          </p>
          <div style={styles.actions}>
          <button onClick={async () => await answerCall()} style={styles.accept}>✅ Nhận</button>
            <button onClick={rejectCall} style={styles.reject}>❌ Từ chối</button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  popup: {
    position: "fixed",
    bottom: 90,
    right: 400,
    width: 320,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 8,
    zIndex: 9999,
    padding: 10,
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
  header: {
    margin: 0,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  caller: {
    marginBottom: 10,
    fontSize: 15,
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  accept: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "6px 12px",
    cursor: "pointer",
  },
  reject: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default VideoCallPopup;