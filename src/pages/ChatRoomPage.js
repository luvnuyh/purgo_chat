import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNickname } from "../context/NicknameContext";
import { useNavigate } from "react-router-dom";

// 욕설 감지 함수 (API 연동 또는 자체 구현 예정)
const detectBadWords = async (message) => {
    try {
        const response = await fetch("http://localhost:5000", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: message }),
        });

        const data = await response.json();
        return data.badWordCount || 0;
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        return 0;
    }
};

const ChatPage = () => {
    const socketRef = useRef(null);
    const { nickname } = useNickname();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [badWordCount, setBadWordCount] = useState(0);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        if (!nickname) {
            alert("닉네임이 없습니다. 다시 입장해 주세요.");
            navigate("/");
            return;
        }

        socketRef.current = io("http://localhost:8080");

        socketRef.current.emit("join", nickname);

        socketRef.current.on("participants", (list) => {
            setParticipants(list);
        });

        socketRef.current.on("chat message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [nickname]);

    const sendMessage = () => {
        if (input.trim()) {
            const time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            const messageData = {
                senderName: nickname,
                message: input,
                time,
            };

            socketRef.current.emit("chat message", messageData);

            // 입력창 즉시 초기화
            const messageToCheck = input;  // 클로저로 복사
            setInput("");

            // 욕설 감지는 따로 비동기 처리
            detectBadWords(messageToCheck)
                .then((detected) => {
                    if (detected > 0) {
                        setBadWordCount((prev) => prev + detected);
                    }
                })
                .catch((error) => {
                    console.error("욕설 감지 중 오류:", error);
                });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                    onClick={() => setShowParticipants(!showParticipants)}
                >
                    참여자 목록
                </button>
                <div className="text-red-600 font-bold">
                    욕설 횟수: {badWordCount}
                </div>
            </div>

            {/* Participants Panel */}
            {showParticipants && (
                <div className="mb-4 bg-white p-2 rounded shadow">
                    <h2 className="font-semibold mb-2">👥 참여자</h2>
                    <ul className="list-disc pl-5">
                        {participants.map((p, idx) => (
                            <li key={idx}>{p}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${
                            msg.senderName === nickname
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-xs p-2 rounded-lg shadow ${
                                msg.senderName === nickname
                                    ? "bg-green-300 text-black"
                                    : "bg-gray-300 text-black"
                            }`}
                        >
                            <div className="text-sm font-semibold">
                                {msg.senderName}
                            </div>
                            <div>{msg.message}</div>
                            <div className="text-xs text-gray-600 text-right">
                                {msg.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex mt-4">
                <input
                    className="flex-1 p-2 border rounded-md mr-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요"
                />
                <button
                    onClick={sendMessage}
                    className="bg-green-400 text-white px-4 py-2 rounded-md hover:bg-green-500"
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
