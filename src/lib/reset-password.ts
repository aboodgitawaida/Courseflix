import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const resetPassword = createServerFn()
  .validator((email: string) => email)
  .handler(async (email) => {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!serviceRoleKey || !resendApiKey || !supabaseUrl) {
        return { error: 'Server environment variables not configured' };
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const resend = new Resend(resendApiKey);

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: 'https://www.courseflix.ca/auth/reset-password' },
      });

      if (error || !data.properties?.action_link) {
        return { error: error?.message || 'User not found' };
      }

      await resend.emails.send({
        from: 'CourseFlix <noreply@courseflix.ca>',
        to: [email],
        subject: 'Reset your CourseFlix password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your CourseFlix password:</p>
            <a href="${data.properties.action_link}" style="display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      return { success: true };
    } catch (err: any) {
      return { error: err.message || 'Internal Server Error' };
    }
  });
