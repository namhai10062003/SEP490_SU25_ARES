import { getIO } from "../socket.js";

// 🔹 Emit to a single connected user by userId
export function emitToUser(userId, event, payload) {
    const io = getIO();
    const socket = [...io.sockets.sockets.values()].find(
        (s) => s.userId === userId.toString()
    );

    if (socket) {
        socket.emit(event, payload);
    } else {
        console.warn(`⚠️ Không tìm thấy socket cho userId: ${userId}`);
    }
}

// 🔹 Emit to multiple users
export function emitToUsers(userIds = [], event, payload) {
    const io = getIO();
    const sockets = [...io.sockets.sockets.values()];

    userIds.forEach((id) => {
        const socket = sockets.find((s) => s.userId === id.toString());
        if (socket) {
            socket.emit(event, payload);
        } else {
            console.warn(`⚠️ Không tìm thấy socket cho userId: ${id}`);
        }
    });
}

// 🔹 Emit to all users (broadcast)
export function broadcast(event, payload) {
    const io = getIO();
    io.emit(event, payload);
}

// 🔹 Optional: send notification object to a user
export function emitNotification(userId, notification) {
    emitToUser(userId, "newNotification", {
        message: notification.message,
        createdAt: notification.createdAt,
        _id: notification._id,
    });
}
