import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNickname } from "../context/NicknameContext";

const NicknameForm = () => {
    const [input, setInput] = useState("");
    const { setNickname } = useNickname();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (input.trim()) {
            setNickname(input.trim());         // Context에 저장
            navigate("/chat");                 // ChatPage에서 socket 연결하게 함
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center mt-20">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="p-2 border rounded-md w-64 mb-4"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
                입장
            </button>
        </form>
    );
};

export default NicknameForm;
