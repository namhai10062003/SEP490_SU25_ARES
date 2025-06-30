"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../../../context/authContext"

const GoogleCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const code = searchParams.get("code")
            const error = searchParams.get("error")

            if (error) {
                toast.error(`Google login failed: ${error}`)
                navigate("/login")
                return
            }

            if (code) {
                try {
                    // Send the authorization code to your backend
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ code }),
                    })

                    const data = await response.json()

                    if (response.ok && data.success) {
                        login(data.user, data.token)
                        toast.success("🎉 Đăng nhập Google thành công!")
                        navigate("/")
                    } else {
                        toast.error(data.error || "Google login failed")
                        navigate("/login")
                    }
                } catch (error) {
                    console.error("Google callback error:", error)
                    toast.error("Đã xảy ra lỗi khi xử lý đăng nhập Google")
                    navigate("/login")
                }
            } else {
                navigate("/login")
            }
        }

        handleGoogleCallback()
    }, [searchParams, navigate, login])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="spinner-large"></div>
                <p className="mt-4 text-lg">Đang xử lý đăng nhập Google...</p>
            </div>
        </div>
    )
}

export default GoogleCallback
