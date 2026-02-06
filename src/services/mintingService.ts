/**
 * Minting Service for Trainer Shop
 * Creates delegate inscriptions via UniSat API (through existing backend)
 */

import { sendMultipleBitcoinPayments } from '../utils/wallet';

// Use the same backend as the main project
const API_URL = import.meta.env.VITE_API_URL || 'https://bitcoin-ordinals-backend-production.up.railway.app';

// Admin payment address for item fees
const ADMIN_PAYMENT_ADDRESS = '3PxmhPTh8p7K7xhJeb2Hf8QbMnsagrJxcG';

interface MintResult {
  inscriptionId: string;
  txid: string;
  paymentTxid?: string;
}

/**
 * Creates a delegate inscription for a Trainer item
 */
export const mintTrainerDelegate = async (
  originalInscriptionId: string,
  itemName: string,
  recipientAddress: string,
  feeRate: number,
  walletType: 'unisat' | 'xverse',
  itemPrice: number // Price in sats
): Promise<MintResult> => {
  console.log(`[MintingService] Creating delegate for ${itemName}`);
  console.log(`[MintingService] Original: ${originalInscriptionId}`);
  console.log(`[MintingService] Recipient: ${recipientAddress}`);
  console.log(`[MintingService] Fee Rate: ${feeRate} sat/vB`);
  console.log(`[MintingService] Price: ${itemPrice} sats`);

  // Create delegate HTML content
  const delegateContent = {
    p: 'ord-20',
    op: 'delegate',
    originalInscriptionId: originalInscriptionId,
    name: itemName,
    collection: 'Trainer Collection',
    contentType: 'html',
    timestamp: Date.now(),
  };

  // HTML template with iframe for interactive HTML inscriptions
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="application/json" id="delegate-metadata">
${JSON.stringify(delegateContent)}
</script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
iframe { width: 100%; height: 100vh; border: 0; display: block; }
</style>
</head>
<body>
<iframe src="/content/${originalInscriptionId}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-fullscreen" allowfullscreen></iframe>
</body>
</html>`;

  // Create file for upload
  const htmlFile = new File(
    [htmlContent],
    `${itemName.replace(/\s/g, '-')}-${Date.now()}.html`,
    { type: 'text/html' }
  );

  console.log(`[MintingService] HTML file created: ${htmlFile.name} (${htmlFile.size} bytes)`);

  // Create FormData for API request
  const formData = new FormData();
  formData.append('file', htmlFile);
  formData.append('address', recipientAddress);
  formData.append('feeRate', feeRate.toString());
  formData.append('postage', '546'); // Bitcoin Dust-Limit
  formData.append('delegateMetadata', JSON.stringify(delegateContent));

  // Send to UniSat API via backend
  const response = await fetch(`${API_URL}/api/unisat/inscribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to create inscription');
  }

  const data = await response.json();
  console.log(`[MintingService] API Response:`, data);

  if (data.status !== 'ok') {
    throw new Error(data.error || 'UniSat API returned unexpected format');
  }

  const result = data.result || data.data?.data;
  if (!result) {
    throw new Error('No result data in API response');
  }

  if (!result.payAddress || !result.amount) {
    throw new Error('UniSat API did not return payment details');
  }

  console.log(`[MintingService] Pay Address: ${result.payAddress}`);
  console.log(`[MintingService] Inscription Fee: ${result.amount} BTC`);

  // Prepare payments: Item price (to Admin) + Inscription fees (to UniSat)
  const payments: Array<{ address: string; amount: number }> = [];

  // 1. Item price to Admin address
  if (itemPrice > 0) {
    const itemPriceBTC = itemPrice / 100000000;
    payments.push({
      address: ADMIN_PAYMENT_ADDRESS,
      amount: itemPriceBTC
    });
    console.log(`[MintingService] Item price: ${itemPriceBTC.toFixed(8)} BTC (${itemPrice} sats)`);
  }

  // 2. Inscription fees to UniSat
  payments.push({
    address: result.payAddress,
    amount: result.amount
  });
  console.log(`[MintingService] Inscription fees: ${result.amount.toFixed(8)} BTC`);

  // Calculate total
  const totalBTC = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSats = Math.round(totalBTC * 100000000);
  console.log(`[MintingService] Total payment: ${totalBTC.toFixed(8)} BTC (${totalSats} sats)`);

  // Execute payment
  const paymentTxid = await sendMultipleBitcoinPayments(payments, walletType);

  if (!paymentTxid) {
    throw new Error('Payment transaction failed');
  }

  console.log(`[MintingService] ✅ Payment successful, TXID: ${paymentTxid}`);

  return {
    inscriptionId: result.inscriptionId || `pending-${result.orderId}`,
    txid: result.txid || result.orderId,
    paymentTxid: paymentTxid,
  };
};
