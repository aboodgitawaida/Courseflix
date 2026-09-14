import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const resend = new Resend(process.env.RESEND_API_KEY || '');

export const resetPassword = createServerFn()
  .validator((email: string) => email)
  .handler(async (email) => {
    try {
      if (!email) {
        return { error: 'Email is required' };
      }

      // 1. Generate recovery link via Supabase Admin
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: 'https://courseflix.ca/auth/reset-password',
        },
      });

      if (error || !data.properties?.action_link) {
        return { error: error?.message || 'User not found' };
      }

      const actionLink = data.properties.action_link;

      // 2. Send email via Resend HTTP API
      const emailResult = await resend.emails.send({
        from: 'CourseFlix <noreply@courseflix.ca>',
        to: [email],
        subject: 'Reset your CourseFlix password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your CourseFlix password:</p>
            <a href="${actionLink}" style="display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      if (emailResult.error) {
        return { error: emailResult.error.message };
      }

      return { success: true };
    } catch (err) {
      return { error: 'Internal server error' };
    }
  });
