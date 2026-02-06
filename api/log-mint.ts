import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { minterAddress, trainerName, inscriptionId, txid, price, timestamp } = req.body;

    if (!minterAddress || !trainerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mintData = {
      id: `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      minterAddress,
      trainerName,
      inscriptionId: inscriptionId || 'pending',
      txid: txid || 'pending',
      price: price || 5000,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Speichere in Redis Liste
    await redis.lpush('trainer-mints', JSON.stringify(mintData));

    console.log('[log-mint] Saved:', mintData);

    return res.status(200).json({ success: true, id: mintData.id });
  } catch (error: any) {
    console.error('[log-mint] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
