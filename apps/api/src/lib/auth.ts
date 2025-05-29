import { serverConfig } from "@/config/server-config";
import prisma from "@/utils/prisma-client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailTemplates, sendTemplateEmail } from "./email";

export const auth = betterAuth({
  trustedOrigins: [...serverConfig.trustedOrigins],
  database: prismaAdapter(prisma, {
    debugLogs: true,
    provider: "postgresql",
  }),
  baseURL: serverConfig.baseURL, // e.g. http://localhost:5001
  logger: {
    level: "debug",
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, token, url }, request) => {
      console.log("Sending reset password email to:", user);

      const resetUrl = `${serverConfig.clientUrl}/reset-password/${token}?callbackURL=/reset-password`;
      console.log("Reset password URL:", resetUrl, url);

      // //TODO rate limit?
      // const response = await sendEmail({
      //   from: "Acme <onboarding@resend.dev>",
      //   to: [user.email],
      //   subject: "Reset your password",
      //   reply_to: "info@example.com",
      //   react: ResetPassword({
      //     userFirstName: user.name,
      //     resetPasswordLink: resetUrl,
      //   }),
      // });

      const template = emailTemplates.resetPassword(resetUrl);
      await sendTemplateEmail({
        to: user.email,
        ...template,
      });
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      // Custom error handling
      console.error("Auth error:", error, ctx);
    },
    errorURL: "/auth/error",
  },

  advanced: {
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none", // Allows CORS-based cookie sharing across subdomains
      partitioned: true, // New browser standards will mandate this for foreign cookies
    },
    // cookies: {
    //   session_cookies: {
    //     attributes: {
    //       sameSite: "None",
    //       secure: true, // Use secure cookies in production
    //       httpOnly: true, // Prevent JavaScript access to cookies
    //     },
    //   },
    // },
  },
});
