'use server';

import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome-email'
import { ExpiredAdEmail } from '@/emails/expired-ad-email'

type EmailType = 'welcome' | 'expired';

interface SendEmailParams {
    to: string;
    type: EmailType;
    props: any;
}

export async function sendEmail({
    to,
    type,
    props
}: SendEmailParams) {
    let subject = '';
    let component = null;

    try {
        switch (type) {
            case 'welcome':
                subject = 'Twoje ogłoszenie zostało utworzone! 🚀';
                component = WelcomeEmail(props);
                break;
            case 'expired':
                subject = 'Twoje ogłoszenie wygasło';
                component = ExpiredAdEmail(props);
                break;
            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        await resend.emails.send({
            from: 'Korepetycje <onboarding@resend.dev>',
            to,
            subject,
            react: component
        });

        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}