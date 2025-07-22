import React, { useEffect, useState, useRef } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ScrollButtons = () => {
    const [visible, setVisible] = useState(true);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(true);
    const timeoutRef = useRef(null);

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.scrollHeight;

        setCanScrollUp(scrollTop > 50);
        setCanScrollDown(scrollTop + windowHeight < fullHeight - 50);

        setVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(false), 1000);
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

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
                bottom: "80px",
                right: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 2000,
                transition: "opacity 0.3s ease",
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
            }}
        >
            <button
                onClick={scrollToTop}
                disabled={!canScrollUp}
                className="btn btn-light shadow-sm"
                title="Lên đầu trang"
                style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "0",
                    backgroundColor: "#f8f9fa",
                    opacity: canScrollUp ? 1 : 0,
                    transition: "opacity 0.3s ease",
                }}
            >
                <FaArrowUp />
            </button>

            <button
                onClick={scrollToBottom}
                disabled={!canScrollDown}
                className="btn btn-light shadow-sm"
                title="Xuống cuối trang"
                style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "0",
                    backgroundColor: "#f8f9fa",
                    opacity: canScrollDown ? 1 : 0,
                    transition: "opacity 0.3s ease",
                }}
            >
                <FaArrowDown />
            </button>
        </div>
    );
};

export default ScrollButtons;
