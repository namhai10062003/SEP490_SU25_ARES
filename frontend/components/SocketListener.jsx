import { useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const SocketListener = () => {
    const { socket } = useSocket();
    const { logout } = useAuth();

    useEffect(() => {
        if (!socket) return;
        const handler = (data) => {
            toast.error(data.message || "Tài khoản của bạn đã bị khóa!");
        };
        socket.on("blocked", handler);
        return () => socket.off("blocked", handler);
    }, [socket, logout]);

    return null;
};

export default SocketListener;