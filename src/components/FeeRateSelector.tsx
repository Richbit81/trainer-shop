import React, { useState, useEffect } from 'react';
import { getCurrentFeeRates } from '../services/bitcoinFees';

interface FeeRateSelectorProps {
  selectedFeeRate: number;
  onFeeRateChange: (feeRate: number) => void;
}

export const FeeRateSelector: React.FC<FeeRateSelectorProps> = ({
  selectedFeeRate,
  onFeeRateChange,
}) => {
  const [feeRates, setFeeRates] = useState<{
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customFeeRate, setCustomFeeRate] = useState<string>('');

  useEffect(() => {
    const loadFeeRates = async () => {
      setLoading(true);
      try {
        const rates = await getCurrentFeeRates();
        if (rates) {
          setFeeRates(rates);
          if (!selectedFeeRate || selectedFeeRate === 1) {
            onFeeRateChange(rates.halfHourFee);
          }
        }
      } catch (error) {
        console.warn('Failed to load fee rates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeeRates();
    const interval = setInterval(() => {
      getCurrentFeeRates().then(rates => {
        if (rates) setFeeRates(rates);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !feeRates) {
    return (
      <div className="glass-card p-3">
        <p className="text-xs text-gray-400">Loading fee rates...</p>
      </div>
    );
  }

  const isCustom = customFeeRate !== '' || (
    selectedFeeRate !== feeRates.economyFee && 
    selectedFeeRate !== feeRates.halfHourFee && 
    selectedFeeRate !== feeRates.fastestFee
  );

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-white uppercase block">Fee Rate</label>
          <p className="text-[9px] text-gray-400 mt-0.5">Current Mempool rates</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-hot-pink font-mono font-bold">{selectedFeeRate} sat/vB</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { onFeeRateChange(feeRates.economyFee); setCustomFeeRate(''); }}
          className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition ${
            selectedFeeRate === feeRates.economyFee && !isCustom
              ? 'bg-gradient-pink-blue text-white border-transparent'
              : 'bg-white/5 text-gray-300 border-white/10 hover:border-hot-pink/50'
          }`}
        >
          Economy
          <div className="text-[9px] text-gray-400 mt-0.5">{feeRates.economyFee} sat/vB</div>
        </button>

        <button
          onClick={() => { onFeeRateChange(feeRates.halfHourFee); setCustomFeeRate(''); }}
          className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition ${
            selectedFeeRate === feeRates.halfHourFee && !isCustom
              ? 'bg-gradient-pink-blue text-white border-transparent'
              : 'bg-white/5 text-gray-300 border-white/10 hover:border-hot-pink/50'
          }`}
        >
          Medium ✓
          <div className="text-[9px] text-gray-400 mt-0.5">{feeRates.halfHourFee} sat/vB</div>
        </button>

        <button
          onClick={() => { onFeeRateChange(feeRates.fastestFee); setCustomFeeRate(''); }}
          className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition ${
            selectedFeeRate === feeRates.fastestFee && !isCustom
              ? 'bg-gradient-pink-blue text-white border-transparent'
              : 'bg-white/5 text-gray-300 border-white/10 hover:border-hot-pink/50'
          }`}
        >
          Fast
          <div className="text-[9px] text-gray-400 mt-0.5">{feeRates.fastestFee} sat/vB</div>
        </button>
      </div>

      <div className="pt-2 border-t border-white/10">
        <label className="text-[10px] text-gray-400 block mb-1">Custom (sat/vB):</label>
        <input
          type="number"
          min="1"
          step="1"
          value={customFeeRate || (isCustom ? String(selectedFeeRate) : '')}
          onChange={(e) => {
            setCustomFeeRate(e.target.value);
            const numValue = parseInt(e.target.value, 10);
            if (!isNaN(numValue) && numValue >= 1) {
              onFeeRateChange(numValue);
            }
          }}
          placeholder="e.g. 5"
          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white font-mono focus:border-hot-pink focus:outline-none"
        />
      </div>
    </div>
  );
};
