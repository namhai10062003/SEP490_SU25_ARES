import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./authContext";

// Tạo context
const SocketContext = createContext();

// Custom hook
export const useSocket = () => useContext(SocketContext);

// Provider
const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (user?._id) {
            socketRef.current = io(import.meta.env.VITE_API_URL);
            socketRef.current.emit("register", user._id);
            socketRef.current.emit("register-user", user._id);
            setSocketConnected(true);
        } else {
            setSocketConnected(false);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocketConnected(false);
        };
    }, [user?._id]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, socketConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default SocketProvider;