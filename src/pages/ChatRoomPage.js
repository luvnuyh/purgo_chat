import React, { useEffect, useRef, useState } from "react";
import { useNickname } from "../context/NicknameContext";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
    const socketRef = useRef(null);
    const chatEndRef = useRef(null);
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

        socketRef.current = new WebSocket("ws://localhost:8081/ws/chat");

        socketRef.current.onopen = () => {
            console.log("웹소켓 연결됨");
            socketRef.current.send(
                JSON.stringify({ type: "ENTER", sender: nickname })
            );
        };

        // 🔁 수정된 부분: 메시지 타입에 따라 분기 처리
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            const { type, sender, time } = data;

            if (type === "ENTER") {
                // 참여자 추가
                setParticipants(prev => {
                    if (!prev.includes(sender)) {
                        return [...prev, sender];
                    }
                    return prev;
                });
                setMessages(prev => [...prev, { sender: "system", content: `${sender}님이 입장하셨습니다.`, time }]);
            } else if (type === "LEAVE") {
                // 참여자 제거
                setParticipants(prev => prev.filter(p => p !== sender));
                setMessages(prev => [...prev, { sender: "system", content: `${sender}님이 퇴장하셨습니다.`, time }]);
            } else if (type === "TALK") {
                setMessages(prev => [...prev, data]);

                // 서버에서 badWordCount 전달 시 업데이트
                if (typeof data.badWordCount === "number") {
                    setBadWordCount(data.badWordCount);
                }

                // 대화 참여자 자동 업데이트
                setParticipants(prev => {
                    if (!prev.includes(sender)) {
                        return [...prev, sender];
                    }
                    return prev;
                });
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
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (input.trim()) {
            const time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            const messageData = {
                type: "TALK",
                sender: nickname,
                content: input,
                time,
            };

            socketRef.current.send(JSON.stringify(messageData));
            setInput("");
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

            <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${
                            msg.sender === nickname
                                ? "justify-end"
                                : msg.sender === "system"
                                    ? "justify-center"
                                    : "justify-start"
                        }`}
                    >
                        <div0
                            className={`max-w-xs p-2 rounded-lg shadow ${
                                msg.sender === nickname
                                    ? "bg-green-300 text-black"
                                    : msg.sender === "system"
                                        ? "bg-yellow-200 text-gray-700"
                                        : "bg-gray-300 text-black"
                            }`}
                        >
                            {msg.sender !== "system" && (
                                <div className="text-sm font-semibold">{msg.sender}</div>
                            )}
                            <div>{msg.content}</div>
                            {msg.time && (
                                <div className="text-xs text-gray-600 text-right">
                                    {msg.time}
                                </div>
                            )}
                        </div0>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

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
