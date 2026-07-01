import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerEmail } = req.body as {
      items: { name: string; price: number; quantity: number }[];
      customerEmail?: string;
    };

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        // price in cents, item.price is in EUR with VAT included
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.origin || 'https://zamlux.de';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'de',
      payment_method_types: ['card'],
      line_items,
      customer_email: customerEmail,
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}