'use server';

import { resend } from '@/lib/resend';
import { createClient } from '@/lib/supabase/server';

export async function sendBulkEmail(adIds: string[], subject: string, content: string) {
    if (!adIds.length) return { success: false, message: 'No recipients selected' };

    const supabase = await createClient();

    // Fetch emails for the selected ads
    const { data: ads, error } = await supabase
        .from('ads')
        .select('email')
        .in('id', adIds);

    if (error || !ads) {
        console.error('Error fetching emails:', error);
        return { success: false, message: 'Failed to fetch recipient emails' };
    }

    const emails = ads.map(ad => ad.email).filter(Boolean); // Filter out empty emails

    if (emails.length === 0) {
        return { success: false, message: 'No valid email addresses found' };
    }


    let sentCount = 0;

    // Using Promise.allSettled might be too aggressive for rate limits, so let's do simple loop or smaller batches.
    for (const email of emails) {
        try {
            await resend.emails.send({
                from: 'Korepetycje Marketplace <onboarding@resend.dev>', // Replace with your verified domain
                to: email,
                subject: subject,
                html: `<p>${content}</p>`, // Basic HTML wrapper
            });
            sentCount++;
        } catch (err) {
            console.error(`Failed to send email to ${email}:`, err);
        }
    }

    return { success: true, message: `Sent ${sentCount} emails.` };
}
