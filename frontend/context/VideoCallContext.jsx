import Peer from "peerjs";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "./authContext";
import { useSocket } from "./socketContext";

const VideoCallContext = createContext();

export const VideoCallProvider = ({ userId, children }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [peerReady, setPeerReady] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const { user } = useAuth();
  const { socket } = useSocket();

  const peerRef = useRef();
  const currentCall = useRef();
  const callStartTime = useRef(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const sendMessage = async (msg) => {
    try {
      await fetch("http://localhost:4000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error("❌ Không thể gửi message:", err);
    }
  };

  useEffect(() => {
    if (!socket || !userId) return;
    const register = () => socket.emit("register-user", userId);
    socket.on("connect", register);
    if (socket.connected) register();
    return () => socket.off("connect", register);
  }, [socket, userId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const createPeer = (customId = null) => {
    return new Peer(customId || undefined, {
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });
  };

  useEffect(() => {
    if (!userId) return;
    let peer = createPeer(userId);
    peerRef.current = peer;

    peer.on("open", () => setPeerReady(true));
    peer.on("error", (err) => {
      if (err.type === "unavailable-id") {
        peer = createPeer();
        peerRef.current = peer;
        peer.on("open", () => setPeerReady(true));
        peer.on("call", (call) => setIncomingCall(call));
      }
    });

    peer.on("call", (call) => setIncomingCall(call));

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(setLocalStream)
      .catch((err) => console.error("❌ Không lấy được camera/mic:", err));

    return () => peer.destroy();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call-rejected", ({ from }) => {
      toast.info(`🚫 Người dùng ${from} đã từ chối cuộc gọi.`);
      setIsCalling(false);
    });

    socket.on("start-call", ({ from, name }) => {
      setCallerInfo({ id: from, name });
    });

    socket.on("call-canceled", ({ from }) => {
      toast.info(`📵 Cuộc gọi từ ${from} đã bị huỷ.`);
      setIncomingCall(null);
      setCallerInfo(null);
    });

    return () => {
      socket.off("call-rejected");
      socket.off("start-call");
      socket.off("call-canceled");
    };
  }, [socket]);

  const callUser = (remoteUserId) => {
    if (!peerRef.current || !peerReady || !localStream) return;
    if (isCalling) {
      toast.warning("⚠️ Bạn đang gọi người khác, hãy huỷ trước.");
      return;
    }

    setIsCalling(true);
    socket.emit("start-call", {
      from: userId,
      to: remoteUserId,
      name: user?.name || "Người dùng",
    });

    const call = peerRef.current.call(remoteUserId, localStream);
    if (!call) {
      setIsCalling(false);
      return;
    }

    call.on("stream", (remote) => {
      setRemoteStream(remote);
      setCallActive(true);
      setIsCalling(false);
      callStartTime.current = new Date(); // ⏱️ bắt đầu đếm
    });

    call.on("error", () => setIsCalling(false));
    call.on("close", () => {
      endCall();
    });

    currentCall.current = call;
    currentCall.current.initiator = true; 
  };

  const cancelOutgoingCall = async () => {
    if (isCalling && currentCall.current) {
      const targetPeer = currentCall.current.peer;

      socket.emit("cancel-call", { from: userId, to: targetPeer });

      const msg = {
        senderId: userId,
        receiverId: targetPeer,
        content: "📵 Bạn đã có một cuộc gọi nhỡ.",
        type: "missed-call",
        timestamp: new Date().toISOString(),
      };

      try {
        await sendMessage(msg);
      } catch (err) {
        console.error("❌ Gửi message thất bại:", err);
      }

      currentCall.current?.close();
      setIsCalling(false);
      toast.info("🚫 Đã huỷ cuộc gọi.");
    }
  };

  const answerCall = () => {
    if (!incomingCall || !localStream) return;
    incomingCall.answer(localStream);

    incomingCall.on("stream", (remote) => {
      setRemoteStream(remote);
      setCallActive(true);
      callStartTime.current = new Date(); // ⏱️ bắt đầu đếm
    });

    incomingCall.on("close", () => endCall());
    incomingCall.on("error", (err) =>
      console.error("❌ Lỗi khi nhận cuộc gọi:", err)
    );

    currentCall.current = incomingCall;
    setIncomingCall(null);
    setCallerInfo(null);
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("call-rejected", {
        from: user?.name || userId,
        to: incomingCall.peer,
      });

      sendMessage({
        senderId: userId,
        receiverId: incomingCall.peer,
        content: "📵 Bạn đã có một cuộc gọi nhỡ.",
        type: "missed-call",
      });

      toast.info("🚫 Bạn đã từ chối cuộc gọi.");
      incomingCall.close?.();
      setIncomingCall(null);
      setCallerInfo(null);
    }
  };

  const endCall = async () => {
    currentCall.current?.close();
    setCallActive(false);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallerInfo(null);
    setIsCalling(false);
  
    if (callStartTime.current) {
      const duration = Math.floor((new Date() - callStartTime.current) / 1000);
      callStartTime.current = null;
  
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const timeStr =
        minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
  
      const isCaller = currentCall.current?.initiator === true;
      const receiverId = currentCall.current?.peer;
  
      if (isCaller && receiverId) {
        const msg = {
          senderId: userId,
          receiverId,
          content: `📞 Cuộc gọi đã kết thúc. Thời lượng: ${timeStr}.`,
          type: "call-ended",
          timestamp: new Date().toISOString(),
        };
  
        try {
          await sendMessage(msg); // Gửi vào DB
          // socket.emit("sendMessage", msg); // realtime đến phòng
          console.log("📤 [Caller] Gửi tin nhắn kết thúc cuộc gọi:", msg);
        } catch (err) {
          console.error("❌ Không thể gửi message kết thúc:", err);
        }
      } else {
        console.log("🕊️ Không phải người gọi, không gửi call-ended.");
      }
    }
  };
  
  

  return (
    <VideoCallContext.Provider
      value={{
        localStream,
        remoteStream,
        callUser,
        answerCall,
        rejectCall,
        endCall,
        cancelOutgoingCall,
        callActive,
        incomingCall,
        peerReady,
        callerInfo,
        isCalling,
        localVideoRef,
        remoteVideoRef,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => useContext(VideoCallContext);
