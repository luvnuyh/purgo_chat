import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNickname } from "../context/NicknameContext";

const NicknameForm = () => {
    const [input, setInput] = useState("");
    const { setNickname } = useNickname();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = input.trim();
        if (!trimmed) {
            alert("닉네임을 입력하세요.");
            return;
        }

        setNickname(trimmed);
        navigate("/chat");
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
