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
  const [isCalling, setIsCalling] = useState(false); // ✅ NEW

  const { user } = useAuth();
  const { socket } = useSocket();

  const peerRef = useRef();
  const currentCall = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // Gửi "register-user" lên server
  useEffect(() => {
    if (!socket || !userId) return;

    const register = () => {
      socket.emit("register-user", userId);
      console.log("📡 [socket] Gửi register-user:", userId);
    };

    socket.on("connect", register);
    if (socket.connected) register();

    return () => {
      socket.off("connect", register);
    };
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
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });
  };

  useEffect(() => {
    if (!userId) return;

    let peer = createPeer(userId);
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("✅ Peer đã kết nối với ID:", id);
      setPeerReady(true);
    });

    peer.on("error", (err) => {
      console.error("❌ Lỗi peer:", err);
      if (err.type === "unavailable-id") {
        console.warn("⚠️ ID bị chiếm, tạo peer mới...");
        peer = createPeer();
        peerRef.current = peer;
        peer.on("open", (id) => {
          console.log("✅ Peer mới đã kết nối với ID:", id);
          setPeerReady(true);
        });
        peer.on("call", (call) => {
          console.log("📞 Cuộc gọi đến từ:", call.peer);
          setIncomingCall(call);
        });
      }
    });

    peer.on("call", (call) => {
      console.log("📞 Cuộc gọi đến từ:", call.peer);
      setIncomingCall(call);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
      })
      .catch((err) => {
console.error("❌ Không lấy được camera/mic:", err);
      });

    return () => {
      peer.destroy();
    };
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call-rejected", ({ from }) => {
      toast.info(`🚫 Người dùng ${from} đã từ chối cuộc gọi.`);
      setIsCalling(false); // ✅ Dừng gọi nếu bị từ chối
    });

    socket.on("start-call", ({ from, name }) => {
      console.log("📥 Nhận thông tin người gọi:", name);
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

    console.log("📤 Gọi tới:", remoteUserId);
    setIsCalling(true);

    socket.emit("start-call", {
      from: userId,
      to: remoteUserId,
      name: user?.name || "Người dùng",
    });

    const call = peerRef.current.call(remoteUserId, localStream);

    if (!call) {
      console.warn("🚫 Không thể tạo cuộc gọi, call undefined.");
      setIsCalling(false);
      return;
    }

    call.on("stream", (remote) => {
      setRemoteStream(remote);
      setCallActive(true);
      setIsCalling(false); // ✅ Cuộc gọi đã kết nối
    });

    call.on("error", (err) => {
      console.error("❌ Lỗi trong cuộc gọi:", err);
      setIsCalling(false);
    });

    call.on("close", () => {
      console.log("📴 Cuộc gọi đã kết thúc.");
      endCall();
    });

    currentCall.current = call;
  };
  const cancelOutgoingCall = () => {
    if (isCalling && currentCall.current) {
      const targetPeer = currentCall.current.peer;
  
      socket.emit("cancel-call", {
        from: userId,
        to: targetPeer,
      });
  
      currentCall.current?.close();
      setIsCalling(false);
      toast.info("🚫 Đã huỷ cuộc gọi.");
      console.log("📵 Cuộc gọi đã bị huỷ.");
    }
  };
  
  const answerCall = () => {
    if (!incomingCall || !localStream) return;

    console.log("✅ Trả lời cuộc gọi...");

    incomingCall.answer(localStream);

    incomingCall.on("stream", (remote) => {
      setRemoteStream(remote);
      setCallActive(true);
    });

    incomingCall.on("close", () => {
      console.log("📴 Cuộc gọi đã kết thúc.");
      endCall();
    });

    incomingCall.on("error", (err) => {
      console.error("❌ Lỗi khi nhận cuộc gọi:", err);
    });

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

      toast.info("🚫 Bạn đã từ chối cuộc gọi.");
      setIncomingCall(null);
      setCallerInfo(null);
    }
  };

  const endCall = () => {
    currentCall.current?.close();
    setCallActive(false);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallerInfo(null);
    setIsCalling(false);
    console.log("🔚 Kết thúc cuộc gọi.");
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
        cancelOutgoingCall, // ✅ Thêm
        callActive,
        incomingCall,
        peerReady,
        callerInfo,
        isCalling, // ✅ Thêm
        localVideoRef,
        remoteVideoRef,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => useContext(VideoCallContext);