import crypto from "crypto";

/**
 * Verifies the signature Razorpay sends back after a checkout completes
 * (client-side success callback → you confirm server-side before trusting it).
 *
 * Razorpay gives you: razorpay_order_id, razorpay_payment_id, razorpay_signature
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, key_secret) === signature
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

/**
 * Verifies a webhook payload's signature using your Webhook Secret
 * (set in Razorpay Dashboard → Webhooks, separate from your API key secret).
 *
 * Razorpay sends the raw request body + an `x-razorpay-signature` header.
 * IMPORTANT: you must verify against the raw, unparsed body — not JSON.stringify(parsedBody),
 * since key ordering/whitespace differences will break the HMAC check.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

/** Constant-time string comparison to avoid timing attacks on signature checks */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
