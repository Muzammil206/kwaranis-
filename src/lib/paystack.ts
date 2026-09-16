import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const BASE_URL = 'https://api.paystack.co'

interface InitializePaymentOptions {
  email: string
  amount: number       // in NGN (we convert to kobo)
  reference: string
  metadata?: Record<string, unknown>
  callback_url?: string
}

export async function initializePayment(opts: InitializePaymentOptions) {
  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amount * 100,  // kobo
      reference: opts.reference,
      metadata: opts.metadata,
      callback_url: opts.callback_url,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Paystack initialization failed')
  }

  return res.json()
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Paystack verification failed')
  }

  return res.json()
}

// Validate Paystack webhook signature
export function validateWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex')
  return hash === signature
}
