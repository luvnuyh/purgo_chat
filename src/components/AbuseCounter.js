import React from "react";

const AbuseCounter = ({ count }) => {
    return (
        <div className="text-red-500 font-bold text-lg">
            욕설 감지: {count}회
        </div>
    );
};

export default AbuseCounter;
