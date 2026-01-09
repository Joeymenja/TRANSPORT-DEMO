import React, { createContext, useContext, useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';

// Define types manually or assume any for now
type Socket = any;

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to Transport Service (port 8082)
        // Hardcoded hostname for local dev, considering the mobile setup
        // Ideally this comes from env, but for the demo:
        // @ts-ignore
        if (typeof window.io === 'undefined') {
            console.error('Socket.io client not loaded');
            return;
        }
        // @ts-ignore
        const newSocket = window.io('http://192.168.0.111:8082'); 
        
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
