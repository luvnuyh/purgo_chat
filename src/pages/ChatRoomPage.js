import React, { useEffect, useRef, useState } from "react";
import { useNickname } from "../context/NicknameContext";
import { useNavigate } from "react-router-dom";

// 욕설 감지 함수 (KoBERT API 연동)
const detectBadWords = async (message) => {
    try {
        const response = await fetch("http://13.125.55.220:5000/analyze", {
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

const ChatPage = () => {
    const socketRef = useRef(null);
    const chatEndRef = useRef(null); // 자동 스크롤 참조
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
            navigate("/");  // 닉네임이 없으면 홈으로 리디렉션
            return;
        }

        // 웹소켓 연결
        socketRef.current = new WebSocket("ws://localhost:8081/api/chat");  // 서버의 웹소켓 URL

        socketRef.current.onopen = () => {
            console.log("웹소켓 연결됨");
            // 입장 메시지 전송
            socketRef.current.send(
                JSON.stringify({ type: "ENTER", sender: nickname })
            );
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "participants") {
                setParticipants(data.participants);
            } else if (data.type === "chat message") {
                setMessages((prev) => [...prev, data]);
            }
        };

        socketRef.current.onclose = () => {
            console.log("웹소켓 연결 종료");
        };

        return () => {
            socketRef.current.close();
        };
    }, [nickname, navigate]);

    useEffect(() => {
        // 메시지 업데이트 시 스크롤 아래로 이동
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (input.trim()) {
            const time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            const messageToCheck = input;
            setInput("");

            const result = await detectBadWords(messageToCheck);

            const finalMessage = result.isBad
                ? result.rewrittenText
                : messageToCheck;

            const messageData = {
                type: "TALK",
                sender: nickname,
                content: finalMessage,
                time,
            };

            socketRef.current.send(JSON.stringify(messageData));

            if (result.isBad) {
                setBadWordCount((prev) => prev + 1);
            }
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
                            msg.sender === nickname ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-xs p-2 rounded-lg shadow ${
                                msg.sender === nickname
                                    ? "bg-green-300 text-black"
                                    : "bg-gray-300 text-black"
                            }`}
                        >
                            <div className="text-sm font-semibold">{msg.sender}</div>
                            <div>{msg.content}</div>
                            <div className="text-xs text-gray-600 text-right">
                                {msg.time}
                            </div>
                        </div>
                    </div>
                ))}
                {/* 채팅 끝 지점 ref */}
                <div ref={chatEndRef} />
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
