import React from "react";

const ChatMessage = ({ message }) => {
    return (
        <div className="p-2 bg-white rounded shadow mb-2">
            <div className="text-sm text-gray-500">{message.senderName}</div>
            <div>{message.content}</div>
        </div>
    );
};

export default ChatMessage;
