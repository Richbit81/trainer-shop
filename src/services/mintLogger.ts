export const logMint = async (data: {
  minterAddress: string;
  trainerName: string;
  inscriptionId?: string;
  txid?: string;
  price: number;
}): Promise<boolean> => {
  try {
    const response = await fetch('/api/log-mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn('[mintLogger] Failed to log mint:', await response.text());
      return false;
    }

    console.log('[mintLogger] Mint logged successfully');
    return true;
  } catch (error) {
    console.warn('[mintLogger] Error logging mint:', error);
    return false;
  }
};

// Admin Adressen
export const ADMIN_ADDRESSES = [
  '3PxmhPTh8p7K7xhJeb2Hf8QbMnsagrJxcG',
  'bc1pu8xttnuutxx9ygy93afl6w9jfmkkrht03eajqnrdgkum564u26vqysp0rp',
];

export const isAdminAddress = (address: string): boolean => {
  return ADMIN_ADDRESSES.some(admin => 
    admin.toLowerCase() === address.toLowerCase()
  );
};
