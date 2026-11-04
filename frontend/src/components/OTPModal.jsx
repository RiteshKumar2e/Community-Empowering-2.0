import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import "../styles/OTPModal.css";

export default function OTPModal({ isOpen, onClose, email, onVerify, loading }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    // Own flag for the verify request: `loading` from the parent only covers
    // the Google sign-in step.
    const [verifying, setVerifying] = useState(false);
    const busy = loading || verifying;

    useEffect(() => {
        if (isOpen) {
            setOtp(["", "", "", "", "", ""]);
            setError("");
            setVerifying(false);
            // Focus first input for speed
            setTimeout(() => {
                document.getElementById('otp-0')?.focus();
            }, 10);
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${lastIndex}`)?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        if (busy) return;
        setError("");
        setVerifying(true);
        try {
            await onVerify(otpValue);
            // On success the app navigates away; keep "Verifying..." until then.
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid OTP");
            setVerifying(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="otp-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* No close on outside click: a stray tap would throw away
                        the OTP the user is typing. Only "Cancel" closes it. */}
                    <motion.div
                        className="otp-modal-content"
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 600,
                            mass: 0.5
                        }}
                        style={{ transitionDuration: '100ms' }}
                    >
                        <div className="otp-modal-header">
                            <div className="otp-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h2>Verify Your Email</h2>
                            <p>We've sent a 6-digit code to</p>
                            <p className="otp-email">{email}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="otp-form">
                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="otp-input"
                                        autoComplete="one-time-code"
                                        disabled={busy}
                                    />
                                ))}
                            </div>

                            {error && (
                                <motion.div
                                    className="otp-error"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                className="otp-submit"
                                disabled={busy || otp.join("").length !== 6}
                                aria-busy={busy}
                                whileTap={{ scale: 0.99 }}
                            >
                                {busy ? (
                                    <span className="otp-submit-busy">
                                        <Loader2 size={18} className="otp-spinner" aria-hidden="true" />
                                        Verifying...
                                    </span>
                                ) : "Verify OTP"}
                            </motion.button>
                            <p className="otp-status" role="status" aria-live="polite">
                                {verifying ? "Checking your code, please wait..." : ""}
                            </p>

                            <button
                                type="button"
                                className="otp-cancel"
                                onClick={onClose}
                                disabled={busy}
                            >
                                Cancel
                            </button>
                        </form>

                        <div className="otp-footer">
                            <p>Didn't receive the code?</p>
                            <button
                                className="otp-resend"
                                type="button"
                                onClick={async () => {
                                    try {
                                        setError("");
                                        const res = await api.post('/auth/resend-google-otp', { email });
                                        if (res.data.success) {
                                            alert("A new OTP has been sent to your email!");
                                        }
                                    } catch (err) {
                                        setError("Failed to resend OTP. Please try again.");
                                    }
                                }}
                                disabled={busy}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
