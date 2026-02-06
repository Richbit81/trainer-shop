import React, { useState, useCallback } from 'react';
import type { TrainerItem, MintingStatus } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { FeeRateSelector } from './FeeRateSelector';
import { MintingProgress } from './MintingProgress';
import { mintTrainerDelegate } from '../services/mintingService';
import { formatSats } from '../services/bitcoinFees';

interface TrainerCardProps {
  trainer: TrainerItem;
}

export const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => {
  const { walletState } = useWallet();
  const [feeRate, setFeeRate] = useState<number>(10);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>({
    status: 'idle',
    progress: 0,
  });
  const [showMintPanel, setShowMintPanel] = useState(false);

  const handleMint = useCallback(async () => {
    if (!walletState.connected || !walletState.accounts[0]) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    setMintingStatus({
      status: 'processing',
      progress: 10,
      message: 'Preparing delegate inscription...',
    });

    try {
      // Get recipient address (Taproot preferred for Ordinals)
      const ordinalsAccount = walletState.accounts.find(acc => acc.purpose === 'ordinals');
      const recipientAddress = ordinalsAccount?.address || walletState.accounts[0].address;

      setMintingStatus({
        status: 'processing',
        progress: 30,
        message: 'Creating inscription via UniSat API...',
      });

      const result = await mintTrainerDelegate(
        trainer.inscriptionId,
        trainer.name,
        recipientAddress,
        feeRate,
        walletState.walletType as 'unisat' | 'xverse',
        trainer.price
      );

      setMintingStatus({
        status: 'processing',
        progress: 80,
        message: 'Payment confirmed! Waiting for inscription...',
      });

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMintingStatus({
        status: 'completed',
        progress: 100,
        message: 'Successfully minted!',
        inscriptionId: result.inscriptionId,
        txid: result.txid,
        paymentTxid: result.paymentTxid,
      });

    } catch (error: any) {
      console.error('[TrainerCard] Minting error:', error);
      setMintingStatus({
        status: 'failed',
        progress: 0,
        error: error.message || 'Minting failed',
      });
    } finally {
      setIsMinting(false);
    }
  }, [walletState, trainer, feeRate]);

  const resetMintingStatus = () => {
    setMintingStatus({ status: 'idle', progress: 0 });
    setShowMintPanel(false);
  };

  return (
    <div className="glass-card overflow-hidden group hover:shadow-neon-glow transition-all duration-300">
      {/* Preview Image - Square container with scaled iframe */}
      <div 
        className="relative bg-gradient-to-br from-deep-purple to-midnight overflow-hidden"
        style={{ 
          width: '100%',
          paddingBottom: '100%', // Square aspect ratio
        }}
      >
        {/* Iframe wrapper - macht iframe größer und skaliert runter */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300%',
            height: '300%',
            transform: 'translate(-50%, -50%) scale(0.333)',
            transformOrigin: 'center center',
          }}
        >
          <iframe
            src={`https://ordinals.com/content/${trainer.inscriptionId}`}
            title={trainer.name}
            className="border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            scrolling="no"
            style={{ 
              width: '100%', 
              height: '100%',
              touchAction: 'auto',
            }}
          />
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-hot-pink to-dodger-blue px-3 py-1 rounded-full z-10">
          <span className="text-xs font-bold text-white">{formatSats(trainer.price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-hot-pink transition-colors">
          {trainer.name}
        </h3>
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
          {trainer.description}
        </p>
        <p className="text-xs text-gray-500 mb-4">
          🎮 Playable with touch & keyboard arrow keys
        </p>

        {/* Mint Panel Toggle */}
        {!showMintPanel ? (
          <button
            onClick={() => setShowMintPanel(true)}
            className="w-full btn-gradient py-3 text-sm"
          >
            🔥 MINT NOW
          </button>
        ) : (
          <div className="space-y-4">
            {/* Fee Rate Selector */}
            {mintingStatus.status !== 'completed' && (
              <FeeRateSelector
                selectedFeeRate={feeRate}
                onFeeRateChange={setFeeRate}
              />
            )}

            {/* Minting Progress */}
            {mintingStatus.status !== 'idle' && (
              <MintingProgress status={mintingStatus} />
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {mintingStatus.status === 'completed' || mintingStatus.status === 'failed' ? (
                <button
                  onClick={resetMintingStatus}
                  className="flex-1 btn-gradient py-3 text-sm"
                >
                  {mintingStatus.status === 'completed' ? '✨ Mint Another' : '🔄 Try Again'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowMintPanel(false)}
                    disabled={isMinting}
                    className="px-4 py-3 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMint}
                    disabled={isMinting || !walletState.connected}
                    className="flex-1 btn-gradient py-3 text-sm disabled:opacity-50"
                  >
                    {isMinting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Minting...
                      </span>
                    ) : !walletState.connected ? (
                      '🔗 Connect Wallet First'
                    ) : (
                      `💳 Pay ${formatSats(trainer.price)} + fees`
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
