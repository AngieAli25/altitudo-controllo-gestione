import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Check if we already recorded this payment
        const { data: existing } = await supabase
          .from('revenue_entries')
          .select('id')
          .eq('stripe_payment_id', paymentIntent.id)
          .maybeSingle();

        if (existing) {
          // Already recorded, skip
          break;
        }

        const amount = paymentIntent.amount / 100; // Convert from cents to EUR
        const description = paymentIntent.description || `Pagamento Stripe ${paymentIntent.id}`;
        const customerName = typeof paymentIntent.customer === 'string'
          ? paymentIntent.customer
          : null;

        // Insert as revenue entry
        // NOTE: user_id and company_id are left null because this comes from Stripe,
        // not from a logged-in user. An admin should assign company later if needed.
        // We use the first admin user as fallback for user_id (required by RLS).
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id, company_id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (adminProfile) {
          await supabase.from('revenue_entries').insert({
            user_id: adminProfile.id,
            company_id: adminProfile.company_id,
            date: new Date().toISOString().split('T')[0],
            amount,
            description,
            source: 'stripe',
            stripe_payment_id: paymentIntent.id,
            stripe_customer_id: customerName,
            status: 'confirmed',
            notes: `Webhook automatico - Event: ${event.id}`,
          });
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        // Check if we already recorded this invoice
        const { data: existing } = await supabase
          .from('revenue_entries')
          .select('id')
          .eq('stripe_invoice_id', invoice.id)
          .maybeSingle();

        if (existing) {
          break;
        }

        const amount = (invoice.amount_paid ?? 0) / 100;
        const description = `Fattura Stripe ${invoice.number || invoice.id}`;
        const customerName = typeof invoice.customer_name === 'string'
          ? invoice.customer_name
          : null;
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : null;

        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id, company_id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (adminProfile) {
          await supabase.from('revenue_entries').insert({
            user_id: adminProfile.id,
            company_id: adminProfile.company_id,
            date: new Date().toISOString().split('T')[0],
            amount,
            description,
            source: 'stripe',
            stripe_invoice_id: invoice.id,
            stripe_customer_id: customerId,
            client_name: customerName,
            invoice_number: invoice.number ?? null,
            status: 'confirmed',
            notes: `Webhook automatico - Event: ${event.id}`,
          });
        }

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing Stripe webhook:', message);
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
