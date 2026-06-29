import express from 'express';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  const PAYPAL_API = 'https://api-m.paypal.com'; // Production LIVE mode

  async function getPayPalAccessToken() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing from environment variables.');
    }

    const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
    const secret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();

    if (!clientId || !secret) {
      console.error('[PayPal Auth] ERROR: Client ID or Secret is MISSING in environment variables.');
      throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing. Please set them in the app settings.');
    }

    console.log(`[PayPal Auth] Attempting LIVE authentication...`);
    console.log(`[PayPal Auth] Client ID: ${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 8)} (Length: ${clientId.length})`);
    console.log(`[PayPal Auth] Secret: ${secret.substring(0, 4)}...${secret.substring(secret.length - 4)} (Length: ${secret.length})`);

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
      },
    });
    
    const data = await response.json() as any;
    const debugId = response.headers.get('paypal-debug-id');
    
    if (!response.ok) {
      console.error('--- PAYPAL AUTH ERROR (LIVE) ---');
      console.error('Status:', response.status);
      console.error('Debug ID:', debugId);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      let errorMessage = data.error_description || data.error || 'Unknown error';
      if (clientId.startsWith('Ad')) {
        errorMessage += ' (Warning: Your Client ID looks like a SANDBOX key, but the app is in LIVE mode)';
      }
      
      throw new Error(`PayPal Auth Failed: ${errorMessage} (Debug ID: ${debugId})`);
    }
    
    console.log('[PayPal Auth] Token obtained successfully');
    return data.access_token;
  }

  // Create PayPal Order
  app.post('/api/paypal/create-order', async (req, res) => {
    try {
      const { cart } = req.body;
      const accessToken = await getPayPalAccessToken();
      
      // Calculate total with strict dot format
      const total = cart.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0).toFixed(2);
      console.log(`[PayPal Order] Creating order for EUR ${total}`);

      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'EUR',
                value: total,
              },
            },
          ],
        }),
      });

      const data = await response.json();
      const debugId = response.headers.get('paypal-debug-id');
      
      if (!response.ok) {
        console.error('--- PAYPAL CREATE ORDER ERROR ---');
        console.error('Status:', response.status);
        console.error('Debug ID:', debugId);
        console.error('Details:', JSON.stringify(data, null, 2));
        
        let errorMessage = 'PayPal Order Creation failed';
        if (data.details && data.details.length > 0) {
          errorMessage = data.details[0].description || data.message || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        const error: any = new Error(errorMessage);
        error.details = data;
        error.debugId = debugId;
        error.status = response.status;
        throw error;
      }
      res.json(data);
    } catch (error: any) {
      console.error('PayPal Order Error:', error);
      res.status(error.status || 500).json({ 
        error: error.message || 'Failed to create order',
        debugId: error.debugId,
        details: error.details
      });
    }
  });

  // Capture PayPal Order
  app.post('/api/paypal/capture-order', async (req, res) => {
    try {
      const { orderID } = req.body;
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const data = await response.json();
      const debugId = response.headers.get('paypal-debug-id');

      if (!response.ok) {
        console.error('--- PAYPAL CAPTURE ORDER ERROR ---');
        console.error('Status:', response.status);
        console.error('Debug ID:', debugId);
        console.error('Details:', JSON.stringify(data, null, 2));

        let errorMessage = 'PayPal Order Capture failed';
        if (data.details && data.details.length > 0) {
          errorMessage = data.details[0].description || data.message || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }

        const error: any = new Error(errorMessage);
        error.details = data;
        error.debugId = debugId;
        error.status = response.status;
        throw error;
      }
      res.json(data);
    } catch (error: any) {
      console.error('PayPal Capture Error:', error);
      res.status(error.status || 500).json({ 
        error: error.message || 'Failed to capture order',
        debugId: error.debugId,
        details: error.details
      });
    }
  });

  // API Route for sending emails via IONOS SMTP (Keeping existing as fallback or for other uses)
  app.post('/api/send-email', async (req, res) => {
    // ... (existing code stays the same)
    const { to, subject, text, html, replyTo, fromName } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER || 'info@zamlux.de',
        pass: process.env.SMTP_PASSWORD, // Must be provided in environment
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      const info = await transporter.sendMail({
        from: `"${fromName || 'ZAMLUX Cable Shop'}" <${process.env.SMTP_USER || 'info@zamlux.de'}>`,
        to,
        subject,
        text,
        html,
        replyTo: replyTo || undefined,
      });

      console.log('Email sent: %s', info.messageId);
      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('SMTP Error:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_USER || 'info@zamlux.de'}`);
    
    // Debug info for PayPal (masking sensitive data)
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const secret = process.env.PAYPAL_CLIENT_SECRET || '';
    console.log(`PAYPAL_CLIENT_ID: ${clientId ? `Present (Length: ${clientId.length}, Prefix: ${clientId.substring(0, 10)}...)` : 'MISSING'}`);
    console.log(`PAYPAL_CLIENT_SECRET: ${secret ? `Present (Length: ${secret.length}, Prefix: ${secret.substring(0, 10)}...)` : 'MISSING'}`);
    
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.warn('WARNING: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set. PayPal payments will fail.');
    }
    
    if (!process.env.SMTP_PASSWORD) {
      console.warn('WARNING: SMTP_PASSWORD is not set. Email sending will fail.');
    }
  });
}

startServer();
