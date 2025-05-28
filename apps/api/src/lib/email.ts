import { Resend } from "resend";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import {} from "../";
const resend = new Resend(process.env.RESEND_API_KEY);
// Check if the environment variable is set
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export function renderMjmlTemplate(
  templateName: string,
  variables: Record<string, string> = {}
): string {
  const templatePath = path.resolve(
    __dirname,
    "../templates/mjml",
    `${templateName}.mjml`
  );

  try {
    let mjmlContent = fs.readFileSync(templatePath, "utf8");

    // Replace variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      mjmlContent = mjmlContent.replace(regex, value);
    });

    // Convert MJML to HTML
    const { html, errors } = mjml2html(mjmlContent);

    if (errors && errors.length) {
      console.warn("MJML rendering warnings:", errors);
    }

    return html;
  } catch (error) {
    console.error(`Error rendering MJML template ${templateName}:`, error);
    throw error;
  }
}

// Email options interface
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendTemplateEmail({
  to,
  subject,
  text,
  html,
}: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>", // Change this to verified domain
      to,
      subject,
      text,
      html: html || text, // Fallback to text if html is not provided
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export const emailTemplates = {
  resetPassword: (resetUrl: string) => ({
    subject: "Reset your password",
    text: `Click the link to reset your password: ${resetUrl}`,
    html: renderMjmlTemplate("reset-password", { resetUrl }),
  }),
  welcome: (name: string, loginUrl: string) => ({
    subject: "Welcome to Your App",
    text: `Hello ${name}, welcome to Your App! Log in here: ${loginUrl}`,
    html: renderMjmlTemplate("welcome", { name, loginUrl }),
  }),
  // Add more email templates here as needed
};
