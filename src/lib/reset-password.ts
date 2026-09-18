import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const resetPassword = createServerFn()
  .validator((email: string) => email.trim())
  .handler(async ({ data: email }) => {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      console.log('Reset password environment check:', {
        hasServiceRoleKey: !!serviceRoleKey,
        hasResendApiKey: !!resendApiKey,
        hasSupabaseUrl: !!supabaseUrl,
        supabaseUrl,
      });

      if (!serviceRoleKey || !resendApiKey || !supabaseUrl) {
        console.error('Missing environment variables');
        return { error: 'Server environment variables not configured' };
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const resend = new Resend(resendApiKey);

      console.log('Generating recovery link for:', email);
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: 'https://www.courseflix.ca/auth/reset-password',
        },
      });

      if (error || !data.properties?.action_link) {
        console.error('Failed to generate link:', error);
        return { error: error?.message || 'User not found' };
      }

      console.log('Sending email via Resend to:', email);
      const emailResult = await resend.emails.send({
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

      console.log('Email result:', emailResult);

      if (emailResult.error) {
        console.error('Resend error:', emailResult.error);
        return { error: emailResult.error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      return {
        error: err instanceof Error ? err.message : 'Internal Server Error',
      };
    }
  });
