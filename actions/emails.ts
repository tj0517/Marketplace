'use server';

import { resend } from '@/lib/resend';
import { EMAIL_CONFIG } from '@/lib/config';
import { WelcomeEmail } from '@/emails/welcome-email'
import { PaymentBumpEmail } from '@/emails/payment-bump-email'
import { RecoveryLinkEmail } from '@/emails/recovery-link-email'

type EmailType = 'welcome' | 'payment_bump' | 'magic_link';

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
            case 'payment_bump':
                subject = 'Płatność potwierdzona - ogłoszenie podbite 🚀';
                component = PaymentBumpEmail(props);
                break;
            case 'magic_link':
                subject = 'Odzyskiwanie linków do Twoich ogłoszeń';
                component = RecoveryLinkEmail(props);
                break;
            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        // The Resend SDK resolves to { data, error } rather than throwing, so the
        // error field has to be checked explicitly — otherwise a rejected send
        // (suppressed recipient, rate limit, bad address) is reported as success.
        const { error } = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to,
            subject,
            react: component
        });

        if (error) {
            console.error('Email rejected by Resend:', { type, error });
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
