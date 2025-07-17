import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ScrollButtons = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: "100px", // 🪄 higher
                right: "0px",    // 🪄 stick to right edge
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                zIndex: 2000,
            }}
        >
            <button
                onClick={scrollToTop}
                className="btn btn-outline-primary btn-sm shadow"
                title="Lên đầu trang"
                style={{
                    backgroundColor: "#f8f9fa", // 🪄 light background
                    width: "40px",
                    height: "40px",
                    borderRadius: "0",  // 🟥 square
                    marginRight: "0",
                }}
            >
                <FaArrowUp />
            </button>

            <button
                onClick={scrollToBottom}
                className="btn btn-outline-primary btn-sm shadow"
                title="Xuống cuối trang"
                style={{
                    backgroundColor: "#f8f9fa", // 🪄 light background
                    width: "40px",
                    height: "40px",
                    borderRadius: "0",  // 🟥 square
                    marginRight: "0",
                }}
            >
                <FaArrowDown />
            </button>
        </div>
    );
};

export default ScrollButtons;
