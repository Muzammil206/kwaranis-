import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM ?? 'NIS Kwara <onboarding@resend.dev>'

/**
 * Send a password reset email. Failures are logged but never thrown,
 * so user enumeration stays safe on the API level.
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping password reset email to', email)
    return
  }

  const resend = new Resend(apiKey)
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1B5E3B;margin:0 0 8px">Reset your NIS Kwara password</h2>
      <p style="color:#444;font-size:14px;line-height:1.6">
        We received a request to reset the password for your NIS Kwara account.
        Use the link below to choose a new one. This link expires in 1 hour.
      </p>
      <p style="text-align:center;margin:24px 0">
        <a href="${resetUrl}"
           style="display:inline-block;background:#1B5E3B;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:600">Reset Password</a>
      </p>
      <p style="color:#888;font-size:12px;line-height:1.5">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `

  try {
    await resend.emails.send({ from: FROM, to: email, subject: 'Reset your NIS Kwara password', html })
  } catch (err) {
    console.error('[email] Failed to send password reset email:', err)
  }
}