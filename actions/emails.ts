'use server';

import { resend } from '@/lib/resend';
import { EMAIL_CONFIG } from '@/lib/config';
import { WelcomeEmail } from '@/emails/welcome-email'
import { ExpiredAdEmail } from '@/emails/expired-ad-email'
import { ExpiringSoonEmail } from '@/emails/expiring-soon-email'
import { PaymentExtendEmail } from '@/emails/payment-extend-email'
import { PaymentBumpEmail } from '@/emails/payment-bump-email'
import { RecoveryLinkEmail } from '@/emails/recovery-link-email'

type EmailType = 'welcome' | 'expired' | 'expiring_soon' | 'payment_extend' | 'payment_bump' | 'magic_link';

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
            case 'expiring_soon':
                subject = 'Twoje ogłoszenie wkrótce wygaśnie!';
                component = ExpiringSoonEmail(props);
                break;
            case 'payment_extend':
                subject = 'Płatność potwierdzona - ogłoszenie przedłużone ✅';
                component = PaymentExtendEmail(props);
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

        await resend.emails.send({
            from: EMAIL_CONFIG.from,
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