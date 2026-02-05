export interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export const getCurrentFeeRates = async (): Promise<FeeRates | null> => {
  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Failed to fetch fee rates:', response.status);
      return null;
    }

    const data = await response.json();
    
    return {
      fastestFee: Math.round(data.fastestFee) || 20,
      halfHourFee: Math.round(data.halfHourFee) || 10,
      hourFee: Math.round(data.hourFee) || 5,
      economyFee: Math.round(data.economyFee) || 2,
      minimumFee: Math.round(data.minimumFee) || 1,
    };
  } catch (error) {
    console.warn('Error fetching fee rates:', error);
    return {
      fastestFee: 20,
      halfHourFee: 10,
      hourFee: 5,
      economyFee: 2,
      minimumFee: 1,
    };
  }
};

export const formatSats = (sats: number): string => {
  if (sats >= 100000) {
    return `${(sats / 100000000).toFixed(6)} BTC`;
  }
  return `${sats.toLocaleString()} sats`;
};
