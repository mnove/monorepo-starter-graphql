import { readFileSync } from "fs";
import { join } from "path";

export type TemplateVariables = Record<string, string | number>;

export type AvailableTemplates =
  | "verify-email"
  | "reset-password"
  | "invite-user";
export type TemplateFormat = "html" | "txt";

// Define specific variable types for each template
export interface VerifyEmailTemplateVariables {
  name: string;
  verificationUrl: string;
  companyName?: string;
}
export interface ResetPasswordTemplateVariables {
  name: string;
  resetPasswordUrl: string;
  companyName?: string;
}

export interface InviteUserTemplateVariables {
  name: string;
  inviterName: string;
  acceptInvitationUrl: string;
  workspaceName: string;
}
// Generic template variables interface
export interface TemplateVariableMap {
  "verify-email": VerifyEmailTemplateVariables;
  "reset-password": ResetPasswordTemplateVariables;
  "invite-user": InviteUserTemplateVariables;
}

// Template result interface
export interface TemplateResult {
  html: string;
  text: string;
}

export function getEmailTemplate(
  templateName: AvailableTemplates,
  format: TemplateFormat = "html"
): string {
  try {
    // Use relative path from the compiled dist folder to build_production
    const extension = format === "html" ? "html" : "txt";
    const templatePath = join(
      __dirname,
      "../build_production/emails",
      `${templateName}.${extension}`
    );
    return readFileSync(templatePath, "utf8");
  } catch (error) {
    throw new Error(
      `Template ${templateName}.${format} not found: ${(error as Error).message}`
    );
  }
}

// Get both HTML and TXT versions of a template
export function getEmailTemplates(
  templateName: AvailableTemplates
): TemplateResult {
  try {
    const html = getEmailTemplate(templateName, "html");
    const text = getEmailTemplate(templateName, "txt");
    return { html, text };
  } catch (error) {
    throw new Error(
      `Failed to get templates for ${templateName}: ${(error as Error).message}`
    );
  }
}

// Generic render function with type safety
export function renderEmailTemplate<T extends AvailableTemplates>(
  templateName: T,
  variables: TemplateVariableMap[T],
  format: TemplateFormat = "html"
): string {
  try {
    let template = getEmailTemplate(templateName, format);

    // Replace variables in format {{variableName}}
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      template = template.replace(
        regex,
        String(variables[key as keyof typeof variables])
      );
    });

    return template;
  } catch (error) {
    console.log(`Error rendering template ${templateName}.${format}:`, error);
    throw new Error(
      `Failed to render template ${templateName}.${format}: ${(error as Error).message}`
    );
  }
}

/**
 *  Render email templates with variable replacement.
 *  This function will return both HTML and TXT versions of the template
 * @param templateName
 * @param variables
 * @returns
 */
export function renderEmailTemplates<T extends AvailableTemplates>(
  templateName: T,
  variables: TemplateVariableMap[T]
): TemplateResult {
  try {
    const html = renderEmailTemplate(templateName, variables, "html");
    const text = renderEmailTemplate(templateName, variables, "txt");
    return { html, text };
  } catch (error) {
    throw new Error(
      `Failed to render templates for ${templateName}: ${(error as Error).message}`
    );
  }
}

/**
 * Email templates without variable rendering.
 * Get both HTML and TXT versions without any variables replaced
 */
export const templates = {
  verifyEmail: () => getEmailTemplates("verify-email"),
  resetPassword: () => getEmailTemplates("reset-password"),
  inviteUser: () => getEmailTemplates("invite-user"),
} as const;

/**
 * Email templates with variable rendering.
 * Get both HTML and TXT versions with variables replaced
 */
export const emailTemplates = {
  verifyEmail: (variables: VerifyEmailTemplateVariables) =>
    renderEmailTemplates("verify-email", variables),
  resetPassword: (variables: ResetPasswordTemplateVariables) =>
    renderEmailTemplates("reset-password", variables),
  inviteUser: (variables: InviteUserTemplateVariables) =>
    renderEmailTemplates("invite-user", variables),
} as const;
