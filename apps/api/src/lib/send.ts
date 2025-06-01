import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 *  Send an email using Resend service.
 */
export async function sendEmail({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
