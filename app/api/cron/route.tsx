import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from '@/actions/emails';

export async function GET() {
    const supabase = createAdminClient();


    const { data: expiredAds } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .lt('expires_at', new Date().toISOString());

    if (!expiredAds) {
        return Response.json({ error: 'No expired ads found' }, { status: 404 });
    }

    for (const ad of expiredAds) {

        const { error } = await supabase
            .from('ads')
            .update({ status: 'expired' })
            .eq('id', ad.id);

        if (error) {
            console.error('Error updating ad:', error);
            continue;
        }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const manageLink = `${baseUrl}/offers/manage/${ad.management_token}`;

            await sendEmail({
                to: ad.email,
                type: 'expired',
                props: {
                    adTitle: ad.title,
                    manageLink: manageLink
                }
            });
            console.log(`Email sent to ${ad.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${ad.email}:`, error);
        }
    }

    return Response.json({ message: 'Emails sent successfully' }, { status: 200 });
}
