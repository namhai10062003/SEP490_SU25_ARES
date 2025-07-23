import React, { useEffect, useState, useRef } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ScrollButtons = () => {
    const [visible, setVisible] = useState(false);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(true);

    const hideTimer = useRef(null);

    const hotZoneSize = 120;

    const resetHideTimer = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            setVisible(false);
        }, 1000);
    };

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.scrollHeight;

        setCanScrollUp(scrollTop > 50);
        setCanScrollDown(scrollTop + windowHeight < fullHeight - 50);

        setVisible(true);
        resetHideTimer();
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        const isInHotZone =
            clientX >= winW - hotZoneSize && clientY >= winH - hotZoneSize;

        if (isInHotZone) {
            setVisible(true);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        } else {
            resetHideTimer();
        }
    };

    useEffect(() => {
        handleScroll(); // init scroll position
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            if (hideTimer.current) clearTimeout(hideTimer.current);
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
                    opacity: canScrollUp ? 1 : 0.3,
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
                    opacity: canScrollDown ? 1 : 0.3,
                    transition: "opacity 0.3s ease",
                }}
            >
                <FaArrowDown />
            </button>
        </div>
    );
};

export default ScrollButtons;
