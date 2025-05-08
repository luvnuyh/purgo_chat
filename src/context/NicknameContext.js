import React, { createContext, useContext, useState, useEffect } from "react";

const NicknameContext = createContext();

export const NicknameProvider = ({ children }) => {
    const [nickname, setNicknameState] = useState(() => {
        return localStorage.getItem("nickname") || "";
    });

    // 닉네임 설정 시 localStorage에도 저장
    const setNickname = (name) => {
        localStorage.setItem("nickname", name);
        setNicknameState(name);
    };

    return (
        <NicknameContext.Provider value={{ nickname, setNickname }}>
            {children}
        </NicknameContext.Provider>
    );
};

export const useNickname = () => useContext(NicknameContext);
