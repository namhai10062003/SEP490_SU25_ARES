import { useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const SocketListener = () => {
    const { socket } = useSocket();
    const { user, logout } = useAuth();

    // ❌ Khi bị block khỏi hệ thống (status 2), sẽ logout sau 3s
    useEffect(() => {
        if (!socket) return;

        const handleBlockedAccount = (data) => {
            toast.error(data.message || "Tài khoản của bạn đã bị khóa vĩnh viễn. Đăng xuất sau 3 giây...");
            setTimeout(() => {
                logout();
            }, 3000);
        };

        socket.on("blocked_account", handleBlockedAccount);
        return () => socket.off("blocked_account", handleBlockedAccount);
    }, [socket, logout]);

    // 🔔 Notification realtime 
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