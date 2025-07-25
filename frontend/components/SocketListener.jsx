import { useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const SocketListener = () => {
    const { socket } = useSocket();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!socket) return;

        const handler = (data) => {
            toast.error(data.message || "Tài khoản của bạn đã bị khóa!");
        };

        socket.on("blocked_posting", handler);

        return () => socket.off("blocked_posting", handler);
    }, [socket, logout]);

    useEffect(() => {
        if (!socket || !user?._id) return;

        socket.emit("register-user", user._id);

        const handleNewNotification = (notification) => {
            toast.info(notification.message || "Bạn có thông báo mới 🔔");
        };

        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [socket, user]);



    return null;
};

export default SocketListener;
