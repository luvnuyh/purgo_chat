import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// socket 연결을 관리하는 커스텀 훅
let socket;

export const useSocket = (nickname, onMessageReceived) => {
    const [badWordCount, setBadWordCount] = useState(0);

    useEffect(() => {
        // 서버 주소에 맞게 수정 (웹소켓 서버 URL)
        socket = io("ws://localhost:8080/ws/chat");

        // 메시지가 수신되었을 때
        socket.on("message", async (message) => {
            // 메시지에서 욕설을 감지하고, 필요한 처리를 한 후 onMessageReceived를 호출
            const result = await detectBadWords(message.content);

            if (result.isBad) {
                setBadWordCount((prev) => prev + 1); // 욕설 메시지 카운트 증가
                message.content = result.rewrittenText; // 욕설이 포함된 메시지는 수정된 텍스트로 교체
            }

            onMessageReceived(message);
            console.log("메시지 from:", nickname);
        });

        return () => {
            socket.disconnect();
        };
    }, [nickname, onMessageReceived]);

    // 메시지를 서버로 전송하는 함수
    const sendMessage = (message) => {
        if (socket) {
            socket.emit("message", { sender: nickname, content: message });
        }
    };

    // 욕설 감지 함수 (서버 API 호출)
    const detectBadWords = async (message) => {
        try {
            const response = await fetch("http://:5000/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: message }),
            });

            const data = await response.json();

            return {
                isBad: data.final_decision === 1,
                rewrittenText: data.result.rewritten_text,
                confidence: data.kobert.confidence,
                detectedWords: data.fasttext.detected_words,
            };
        } catch (error) {
            console.error("API 호출 중 오류 발생:", error);
            return {
                isBad: false,
                rewrittenText: message,
                confidence: 0,
                detectedWords: [],
            };
        }
    };

    return { sendMessage, badWordCount };
};
