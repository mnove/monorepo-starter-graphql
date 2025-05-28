import { sendTemplateEmail, emailTemplates } from "./email";

/**
 * Example function showing how to send a reset password email
 */
export async function sendResetPasswordEmail(
  email: string,
  resetToken: string
) {
  // Create the reset password URL with the token
  const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;

  const template = emailTemplates.resetPassword(resetUrl);

  await sendTemplateEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  console.log(`Reset password email sent to ${email}`);
}

/**
 * Example function showing how to send a welcome email
 */
export async function sendWelcomeEmail(email: string, name: string) {
  // Create the login URL
  const loginUrl = "https://yourapp.com/login";

  const template = emailTemplates.welcome(name, loginUrl);

  await sendTemplateEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  console.log(`Welcome email sent to ${email}`);
}
