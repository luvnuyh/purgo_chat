import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (nickname, onMessageReceived) => {
    useEffect(() => {
        socket = io("http://localhost:8080"); // 백엔드 주소에 맞게 수정
        socket.on("message", (message) => {
            onMessageReceived(message);
            console.log("메시지 from:", nickname); // nickname을 사용하려면 여기에 사용
        });

        return () => {
            socket.disconnect();
        };
    }, [nickname, onMessageReceived]);

    const sendMessage = (message) => {
        if (socket) {
            socket.emit("message", message);
        }
    };

    return { sendMessage };
};
