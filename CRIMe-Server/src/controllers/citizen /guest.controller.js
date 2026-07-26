// 2. The guest identity problem (this is the hard part)

// A guest has no login, but you can't let anyone who has the tracking code add updates — tracking codes get printed on receipts, shared in WhatsApp groups, etc. So:

// On submission: generate tracking_code + send an OTP/PIN to their phone/email.
// Tracking (read-only): tracking_code + last-4-digits or PIN → view public timeline. Low friction, no session needed.
// Adding an update (write): requires a fresh OTP verification each time, which issues a short-lived guest session token (15–30 min). Tracking code alone is never enough to write.