import crypto from 'crypto';
import redisClient from '../config/redis.js';

const OTP_PREFIX = 'otp:';
const OTP_TTL = 600; // 10 minutes in seconds for OTP verification
const SESSION_TTL = 1800; // 30 minutes in seconds for verified session (case submission)

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const compareOTP = (otp, hashedOTP) => {
  return hashOTP(otp) === hashedOTP;
};

// Store OTP in Redis with auto-expiry
export const storeOTP = async (sessionId, email, hashedOTP) => {
  const key = `${OTP_PREFIX}${sessionId}`;
//   const value = JSON.stringify({
//     hashedOTP,
//     email,
//     createdAt: Date.now()
//   });
  
  await redisClient.setEx(
    key,
    OTP_TTL,
    JSON.stringify({
        hashedOTP,
        email,
        verified: false,
        createdAt: Date.now()
    })
);
};

// Retrieve OTP from Redis
export const getStoredOTP = async (sessionId) => {
  const key = `${OTP_PREFIX}${sessionId}`;
  const value = await redisClient.get(
    key
  );
  
  if (!value) return null;
  
  return JSON.parse(value);
};

export const markOTPVerified = async (sessionId) => {
    const key = `${OTP_PREFIX}${sessionId}`;

    const value = await redisClient.get(key);

    if (!value) return;

    const data = JSON.parse(value);

    data.verified = true;

    // Extend TTL to SESSION_TTL after successful verification
    // This gives users additional time to complete the case form
    await redisClient.setEx(key, SESSION_TTL, JSON.stringify(data));
};




// No need for periodic cleanup - Redis handles TTL automatically
// Delete OTP from Redis (one-time use)
export const invalidateOTP = async (sessionId) => {
    await redisClient.del(`${OTP_PREFIX}${sessionId}`);
};

// No need for periodic cleanup - Redis handles TTL automatically