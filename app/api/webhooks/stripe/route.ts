import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl, STRIPE_CONFIG } from '@/lib/config';

const stripe = STRIPE_CONFIG.secretKey
    ? new Stripe(STRIPE_CONFIG.secretKey)
    : null;

export async function POST(request: NextRequest) {
    if (!stripe || !STRIPE_CONFIG.webhookSecret) {
        console.error('[Stripe Webhook] Stripe not configured');
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('[Stripe Webhook] Missing signature');
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_CONFIG.webhookSecret
        );
    } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const transactionId = session.metadata?.transaction_id;

        if (!transactionId) {
            console.error('[Stripe Webhook] Missing transaction_id in metadata');
            return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { error } = await supabase.rpc('complete_payment', {
            p_transaction_id: transactionId,
            p_payment_id: session.payment_intent as string,
        });

        if (error) {
            console.error('[Stripe Webhook] RPC error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        await supabase
            .from('transactions')
            .update({ webhook_received_at: new Date().toISOString() })
            .eq('id', transactionId);

        const { data: tx } = await supabase
            .from('transactions')
            .select('type, ad_id')
            .eq('id', transactionId)
            .single();

        if (tx?.type === 'activation') {
            const { data: ad } = await supabase
                .from('ads')
                .select('email, title, management_token, id, phone_contact')
                .eq('id', tx.ad_id)
                .single();

            if (ad) {
                if (ad.phone_contact) {
                    try {
                        const { normalizeAndHashPhone } = await import('@/actions/user/hash_phone');
                        const { hash } = normalizeAndHashPhone(ad.phone_contact);

                        await supabase
                            .from('ads')
                            .update({ phone_hash: hash })
                            .eq('id', ad.id);
                    } catch (hashError) {
                        console.error('[Stripe Webhook] Failed to update phone_hash:', hashError);
                    }
                }

                try {
                    const { sendEmail } = await import('@/actions/emails');
                    const baseUrl = getBaseUrl();
                    await sendEmail({
                        to: ad.email,
                        type: 'welcome',
                        props: {
                            adTitle: ad.title,
                            manageLink: `${baseUrl}/offers/manage/${ad.management_token}`,
                            publicLink: `${baseUrl}/offers/${ad.id}`
                        }
                    });
                } catch (emailError) {
                    console.error('[Stripe Webhook] Failed to send welcome email:', emailError);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}

export async function GET() {
    return NextResponse.json({ status: 'Stripe webhook endpoint active' });
}
