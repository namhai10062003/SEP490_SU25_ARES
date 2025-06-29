import Peer from "peerjs";
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useSocket } from "./socketContext";

const VideoCallContext = createContext();

export const VideoCallProvider = ({ userId, children }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [peerReady, setPeerReady] = useState(false);

  const { socket } = useSocket();
  const peerRef = useRef();
  const currentCall = useRef();

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

      // 👉 Nếu ID bị chiếm, tạo lại peer với ID ngẫu nhiên
      if (err.type === "unavailable-id") {
        console.warn("⚠️ ID đã bị chiếm, tạo lại peer với ID random...");
        peer = createPeer();
        peerRef.current = peer;

        peer.on("open", (id) => {
          console.log("✅ Peer (random) đã kết nối với ID:", id);
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

  const callUser = (remoteUserId) => {
    if (!peerRef.current || !peerReady) {
      console.warn("🚫 Peer chưa sẵn sàng.");
      return;
    }

    if (!localStream) {
      console.warn("🚫 localStream chưa sẵn sàng.");
      return;
    }

    console.log("📤 Gọi tới:", remoteUserId);

    const call = peerRef.current.call(remoteUserId, localStream);

    if (!call) {
      console.warn("🚫 Không thể tạo cuộc gọi, call undefined.");
      return;
    }

    call.on("stream", (remote) => {
      console.log("📥 Nhận được remoteStream");
      setRemoteStream(remote);
      setCallActive(true);
    });

    call.on("error", (err) => {
      console.error("❌ Lỗi trong cuộc gọi:", err);
    });

    call.on("close", () => {
      console.log("📴 Cuộc gọi đã kết thúc.");
      endCall();
    });

    currentCall.current = call;
  };

  const answerCall = () => {
    if (!incomingCall || !localStream) return;

    console.log("✅ Đang trả lời cuộc gọi...");

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
  };

  const endCall = () => {
    currentCall.current?.close();
    setCallActive(false);
    setRemoteStream(null);
    setIncomingCall(null);
    console.log("🔚 Đã kết thúc cuộc gọi.");
  };

  return (
    <VideoCallContext.Provider
      value={{
        localStream,
        remoteStream,
        callUser,
        answerCall,
        endCall,
        callActive,
        incomingCall,
        peerReady,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => useContext(VideoCallContext);
