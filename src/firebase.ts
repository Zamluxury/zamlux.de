import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDocFromServer, runTransaction, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// --- Connection Test ---
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}
testConnection();

// --- Error Handling ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Helper to call backend SMTP API ---
async function sendEmailViaAPI(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  fromName?: string;
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to send email');
    }
    return await response.json();
  } catch (error) {
    console.error('API Email Error:', error);
    // We don't throw here to ensure the UI success flow isn't blocked if SMTP fails 
    // (since it's also saved to Firestore as backup)
    return null;
  }
}

export const saveContactMessage = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const path = 'contacts';
  try {
    // 1. Save to contacts for dashboard/history
    const contactRef = await addDoc(collection(db, 'contacts'), {
      ...data,
      to: 'info@zamlux.de',
      createdAt: serverTimestamp(),
      status: 'new'
    });

    // 2. Send Email Notification to info@zamlux.de via Backend SMTP
    const adminEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; color: #111827;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #2563eb; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Zamluxury GmbH</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Premium Cable Shop Notification</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0;"><strong>Absender:</strong> ${data.firstName} ${data.lastName}</p>
          <p style="margin: 0 0 8px 0;"><strong>E-Mail:</strong> <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></p>
          <p style="margin: 0;"><strong>Betreff:</strong> ${data.subject}</p>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="font-size: 13px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Nachricht</p>
          <p style="white-space: pre-wrap; line-height: 1.6; color: #374151; margin: 0;">${data.message}</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; font-size: 12px; color: #9ca3af;">
          Diese Nachricht wurde über das Kontaktformular von zamlux.de gesendet.
        </div>
      </div>
    `;

    await sendEmailViaAPI({
      to: 'info@zamlux.de',
      replyTo: data.email,
      subject: `[Zamluxury GmbH] Neue Kontaktanfrage: ${data.subject}`,
      text: `Neue Kontaktanfrage von ${data.firstName} ${data.lastName} (${data.email}):\n\n${data.message}`,
      html: adminEmailHtml,
      fromName: 'Zamluxury GmbH Webform'
    });

    // 3. Send Auto-Reply to Customer via Backend SMTP
    const customerEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; color: #111827;">
         <h1 style="color: #2563eb; font-size: 20px; font-weight: 800; margin: 0 0 20px 0;">Vielen Dank für Ihr Vertrauen.</h1>
         <p style="font-size: 16px; line-height: 1.6;">Hallo ${data.firstName},</p>
         <p style="font-size: 16px; line-height: 1.6;">wir haben Ihre Nachricht zum Thema <strong>"${data.subject}"</strong> erhalten.</p>
         <p style="font-size: 16px; line-height: 1.6;">Unser Team wird Ihre Anfrage umgehend prüfen. Sie erhalten in der Regel innerhalb der nächsten <strong>4 Stunden</strong> (an Werktagen) eine persönliche Rückmeldung.</p>
         
         <div style="margin: 32px 0; padding: 20px; background: #eff6ff; border-radius: 12px; border: 1px solid #dbeafe;">
           <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Zamluxury GmbH Versprechen:</strong> Schnelle Hilfe und individuelle Beratung für Ihr Hi-Fi Setup.</p>
         </div>

         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Mit freundlichen Grüßen,</p>
         <p style="font-size: 16px; font-weight: 700; color: #2563eb; margin-top: 4px;">Ihr Zamluxury GmbH Team</p>
         
         <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;">
         <p style="font-size: 11px; color: #9ca3af; text-align: center;">Dies ist eine automatische Bestätigung. Sie müssen nicht auf diese E-Mail antworten.</p>
      </div>
    `;

    await sendEmailViaAPI({
      to: data.email,
      subject: `Bestätigung Ihrer Anfrage bei Zamluxury GmbH: ${data.subject}`,
      text: `Hallo ${data.firstName}, vielen Dank für Ihre Nachricht an Zamluxury GmbH. Wir melden uns in Kürзе.`,
      html: customerEmailHtml,
      fromName: 'Zamluxury GmbH Cable Shop'
    });

    // 4. (Optional) Still create 'mail' collection entries for extension if they decided to use it as backup
    await addDoc(collection(db, 'mail'), {
      to: 'info@zamlux.de',
      replyTo: data.email,
      message: {
        subject: `[Zamluxury GmbH] Neue Kontaktanfrage: ${data.subject}`,
        html: adminEmailHtml
      },
      createdAt: serverTimestamp()
    });

    return contactRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveOrder = async (orderData: {
  customer: {
    vorname: string;
    nachname: string;
    email: string;
    strasse: string;
    plz: string;
    stadt: string;
    land: string;
    telefon?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    length: number;
    color?: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  paymentDetails?: any;
}) => {
  const path = 'orders';
  const orderNumber = `ZAM-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = new Date().toLocaleString('de-DE', { 
    dateStyle: 'full', 
    timeStyle: 'medium',
    timeZone: 'Europe/Berlin' 
  });

  try {
    // 1. Save to Firestore using transaction to decrement stock atomically
    const orderRef = doc(collection(db, 'orders'));
    await runTransaction(db, async (transaction) => {
      // Check and decrement stock for each item in the order
      for (const item of orderData.items) {
        const itemColor = item.color || 'Schwarz';
        const docId = `${item.productId}_${itemColor}_${item.length}`;
        const invRef = doc(db, 'inventory', docId);
        const invSnap = await transaction.get(invRef);
        
        let currentStock = 100;
        let currentSold = 0;
        
        // Define default stock based on product and variant
        if (item.productId === 'p1') {
          if (itemColor === 'Schwarz') {
            currentStock = item.length === 50 ? 75 : 75;
          } else {
            currentStock = item.length === 50 ? 50 : 50;
          }
        } else if (item.productId === 'p2') {
          currentStock = itemColor === 'Schwarz' ? 120 : 80;
        } else if (item.productId === 'p3') {
          currentStock = itemColor === 'Schwarz' ? 85 : 50;
        }

        if (invSnap.exists()) {
          const invData = invSnap.data();
          currentStock = invData.stock !== undefined ? invData.stock : currentStock;
          currentSold = invData.sold !== undefined ? invData.sold : currentSold;
        } else {
          // Check if color-only legacy stock exists to migrate
          const legacyRef = doc(db, 'inventory', `${item.productId}_${itemColor}`);
          const legacySnap = await transaction.get(legacyRef);
          if (legacySnap.exists()) {
            const legacyData = legacySnap.data();
            currentStock = legacyData.stock !== undefined ? legacyData.stock : currentStock;
            currentSold = legacyData.sold !== undefined ? legacyData.sold : currentSold;
          }
        }

        const qtyToDeduct = item.quantity || 1;
        const newStock = Math.max(0, currentStock - qtyToDeduct);
        const newSold = currentSold + qtyToDeduct;

        transaction.set(invRef, {
          productId: item.productId,
          color: itemColor,
          length: item.length,
          stock: newStock,
          sold: newSold,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Add history log inside transaction
        const historyRef = doc(collection(db, 'stock_history'));
        transaction.set(historyRef, {
          productId: item.productId,
          color: itemColor,
          length: item.length,
          previousStock: currentStock,
          newStock: newStock,
          changeQuantity: -qtyToDeduct,
          reason: 'Sale',
          user: `System (Kauf - Bestellung #${orderNumber})`,
          orderNumber: orderNumber,
          createdAt: serverTimestamp()
        });
      }

      // Save order
      transaction.set(orderRef, {
        ...orderData,
        orderNumber,
        status: 'paid',
        createdAt: serverTimestamp(),
      });
    });

    // 2. Generate Shared Items HTML
    const orderItemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b; font-weight: 500;">Variante: ${item.length}m &bull; Menge: ${item.quantity}x</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: 700; color: #2563eb;">
          ${(item.price * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </td>
      </tr>
    `).join('');

    // --- CUSTOMER CONFIRMATION TEMPLATE ---
    const confirmationHtml = `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; color: #0f172a; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="color: #2563eb; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; line-height: 1;">ZAMLUX</div>
          <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4em; margin-top: 8px;">Premium Industriekabel</div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 32px; border-radius: 20px; text-align: center; margin-bottom: 40px;">
          <div style="color: #16a34a; font-size: 22px; font-weight: 900; margin-bottom: 12px;">Vielen Dank für Ihre Bestellung!</div>
          <p style="color: #166534; font-size: 15px; margin: 0; line-height: 1.6;">Hallo ${orderData.customer.vorname}, wir haben Ihre Zahlung erhalten и bearbeiten Ihre Bestellung umgehend.</p>
        </div>

        <div style="margin-bottom: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
            <h3 style="font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin: 0;">Ihre Bestellung</h3>
            <span style="font-size: 12px; font-weight: 700; color: #64748b;">${orderNumber}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            ${orderItemsHtml}
            <tr>
              <td style="padding: 32px 0 0 0; font-size: 18px; font-weight: 900; color: #0f172a;">Gesamtsumme (Inkl. MwSt.)</td>
              <td style="padding: 32px 0 0 0; text-align: right; font-size: 28px; font-weight: 900; color: #2563eb;">
                ${orderData.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          </table>
        </div>

        <div style="grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; display: grid;">
          <div style="background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9;">
            <h4 style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Lieferadresse</h4>
            <p style="font-size: 14px; font-weight: 600; line-height: 1.8; margin: 0; color: #334155;">
              ${orderData.customer.vorname} ${orderData.customer.nachname}<br/>
              ${orderData.customer.strasse}<br/>
              ${orderData.customer.plz} ${orderData.customer.stadt}<br/>
              ${orderData.customer.land}
            </p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9;">
            <h4 style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Zahlung</h4>
            <p style="font-size: 14px; font-weight: 600; margin: 0; color: #334155;">
              Methode: <span style="text-transform: capitalize;">${orderData.paymentMethod}</span><br/>
              Status: Erfolgreich bezahlt
            </p>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 40px;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Wir senden Ihnen eine Versandbestätigung, sobald Ihr Paket unser Lager verlässt.</p>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            Haben Sie Fragen? Kontaktieren Sie uns unter info@zamlux.de<br/>
            &copy; ${new Date().getFullYear()} Zamluxury GmbH. Premium Cable Manufacturing.
          </div>
        </div>
      </div>
    `;

    // --- ADMIN NOTIFICATION TEMPLATE ---
    const adminEmailHtml = `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 2px solid #2563eb; border-radius: 24px; color: #0f172a; background: #ffffff;">
        <div style="background: #2563eb; margin: -32px -32px 32px -32px; padding: 32px; border-radius: 22px 22px 0 0; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Neuer Verkauf bei ZAMLUXURY</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 8px 0 0 0; font-weight: 600;">Bestellnummer: ${orderNumber}</p>
        </div>

        <div style="margin-bottom: 32px;">
          <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Bestelldaten</div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Datum/Uhrzeit:</strong> ${orderDate}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Zahlungsmethode:</strong> <span style="text-transform: uppercase; color: #2563eb;">${orderData.paymentMethod}</span></p>
            <p style="margin: 0; font-size: 14px;"><strong>Gesamtbetrag:</strong> <span style="font-size: 18px; font-weight: 900;">${orderData.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></p>
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Verkaufte Produkte</div>
          <table style="width: 100%; border-collapse: collapse;">
            ${orderItemsHtml}
          </table>
        </div>

        <div style="margin-bottom: 32px;">
          <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Kundendaten</div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Name:</strong> ${orderData.customer.vorname} ${orderData.customer.nachname}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>E-Mail:</strong> <a href="mailto:${orderData.customer.email}" style="color: #2563eb; font-weight: 700;">${orderData.customer.email}</a></p>
            <p style="margin: 0 0 16px 0; font-size: 14px;"><strong>Telefon:</strong> ${orderData.customer.telefon || 'Nicht angegeben'}</p>
            <div style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Rechnungs- & Lieferadresse</div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; font-weight: 600;">
              ${orderData.customer.strasse}<br/>
              ${orderData.customer.plz} ${orderData.customer.stadt}<br/>
              ${orderData.customer.land}
            </p>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;">
          <p style="font-size: 12px; color: #94a3b8; font-weight: 700;">ZAMLUXURY AUTOMATED SALES SYSTEM</p>
        </div>
      </div>
    `;

    // 3. Send Email to Customer
    await sendEmailViaAPI({
      to: orderData.customer.email,
      subject: `Bestellbestätigung ${orderNumber}: Vielen Dank für Ihren Einkauf bei ZAMLUXURY`,
      text: `Vielen Dank für Ihre Bestellung ${orderNumber} über ${orderData.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}.`,
      html: confirmationHtml,
      fromName: 'Zamluxury GmbH Premium Shop'
    });

    // 4. Send Notification to Admin
    await sendEmailViaAPI({
      to: 'info@zamlux.de',
      subject: `[NEUER VERKAUF] ${orderNumber} - ${orderData.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} - ${orderData.customer.nachname}`,
      text: `Neuer Verkauf ${orderNumber} von ${orderData.customer.vorname} ${orderData.customer.nachname} (${orderData.customer.email}). Summe: ${orderData.total} EUR. Methode: ${orderData.paymentMethod}`,
      html: adminEmailHtml,
      fromName: 'Zamluxury GmbH Sales Notification'
    });

    return orderRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
