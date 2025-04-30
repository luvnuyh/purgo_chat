import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // 테일윈드 임포트한 파일

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
