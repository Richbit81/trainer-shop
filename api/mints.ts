import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Admin Adressen die Zugriff haben
const ADMIN_ADDRESSES = [
  '3PxmhPTh8p7K7xhJeb2Hf8QbMnsagrJxcG',
  'bc1pu8xttnuutxx9ygy93afl6w9jfmkkrht03eajqnrdgkum564u26vqysp0rp',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Address');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Prüfe Admin-Adresse
    const adminAddress = req.headers['x-admin-address'] as string;
    
    if (!adminAddress || !ADMIN_ADDRESSES.includes(adminAddress)) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    // Hole alle Mints aus Redis
    const mints = await redis.lrange('trainer-mints', 0, -1);
    
    // Parse JSON strings
    const parsedMints = mints.map((mint: any) => {
      try {
        return typeof mint === 'string' ? JSON.parse(mint) : mint;
      } catch {
        return mint;
      }
    });

    // Format für Download
    const format = req.query.format as string;
    
    if (format === 'csv') {
      const csv = [
        'ID,Minter Address,Trainer,Inscription ID,TXID,Price (sats),Timestamp',
        ...parsedMints.map((m: any) => 
          `${m.id},${m.minterAddress},${m.trainerName},${m.inscriptionId},${m.txid},${m.price},${m.timestamp}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=trainer-mints.csv');
      return res.status(200).send(csv);
    }

    return res.status(200).json({ 
      success: true, 
      count: parsedMints.length,
      mints: parsedMints 
    });
  } catch (error: any) {
    console.error('[mints] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
