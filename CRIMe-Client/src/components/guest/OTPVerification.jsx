import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, Clock, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

const OTPVerification = ({ 
  email, 
  sessionId, 
  onVerify, 
  onResendOTP,
  isSendingOTP,
  isVerifying 
}) => {
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const handleVerify = () => {
    if (otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }
    onVerify(otp)
  }

  const handleResend = () => {
    if (resendTimer > 0) return
    onResendOTP()
    setResendTimer(60) // 60 seconds cooldown
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Email Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Mail className="w-5 h-5" />
          <span className="font-medium">OTP sent to:</span>
          <span className="font-semibold">{email}</span>
        </div>
      </div>

      {/* OTP Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Enter Verification Code</label>
        <Input
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
            setOtp(value)
          }}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Check your email for the verification code. It expires in 10 minutes.
        </p>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={isVerifying || otp.length !== 6}
        className="w-full"
      >
        {isVerifying ? 'Verifying...' : 'Verify & Continue'}
      </Button>

      {/* Resend OTP */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {resendTimer > 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Resend in {resendTimer}s</span>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isSendingOTP}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:text-muted-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${isSendingOTP ? 'animate-spin' : ''}`} />
            <span>{isSendingOTP ? 'Sending...' : 'Resend OTP'}</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default OTPVerification
