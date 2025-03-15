import { Resend } from 'resend'

export async function sendWaitlistEmail(email, apiKey) {
  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: 'chartr.ai <team@notifications.chartr.ai>',
      to: email,
      subject: 'You\'re on the list!',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .logo {
            width: 120px;
            margin-bottom: 24px;
        }
        .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            max-width: 500px;
            margin: 0 auto;
        }
        h2 {
            color: #5D3E8E;
            font-size: 24px;
            margin: 0 0 24px 0;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://chartr.ai/logos/logo.png" alt="chartr.ai logo" class="logo">
        
        <h2>You're on the list!</h2>

        <p>Thanks for your interest in chartr.ai!</p>

        <p>We've received your request and will send you an invite very soon!</p>
        
        <hr class="divider">
        
        <p style="color: #666; font-size: 14px;">If you received this by mistake, you can safely ignore this email.</p>
    </div>
</body>
</html>
      `,
    })
    return { success: true }
  }
  catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
