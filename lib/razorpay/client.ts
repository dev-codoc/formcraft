import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables"
  );
}

/**
 * Singleton Razorpay SDK instance — server-side only.
 * Never import this in a client component or expose the secret key to the browser.
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public key is safe to expose to the client (used to open the checkout modal)
export const RAZORPAY_PUBLIC_KEY = process.env.RAZORPAY_KEY_ID;
