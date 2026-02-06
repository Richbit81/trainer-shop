import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { walletState, connect, disconnect, isXverseInstalled } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log on render
  console.log('[WalletConnect] Render - isXverseInstalled:', isXverseInstalled, 'connected:', walletState.connected);

  const handleConnect = async () => {
    console.log('[WalletConnect] Button clicked!');
    console.log('[WalletConnect] isXverseInstalled:', isXverseInstalled);
    setIsConnecting(true);
    setError(null);

    try {
      console.log('[WalletConnect] Calling connect("xverse")...');
      await connect('xverse');
      console.log('[WalletConnect] Connect successful!');
    } catch (err: any) {
      console.error('[WalletConnect] Error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletState.connected) {
    // Find Ordinals (Taproot) and Payment addresses
    const ordinalsAccount = walletState.accounts.find(acc => acc.purpose === 'ordinals' || acc.address.startsWith('bc1p'));
    const paymentAccount = walletState.accounts.find(acc => acc.purpose === 'payment' || !acc.address.startsWith('bc1p'));
    
    const formatAddr = (addr: string) => `${addr.substring(0, 8)}...${addr.substring(addr.length - 4)}`;

    console.log('[WalletConnect] Connected accounts:', walletState.accounts);
    console.log('[WalletConnect] Ordinals account:', ordinalsAccount);
    console.log('[WalletConnect] Payment account:', paymentAccount);

    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <p className="text-xs text-gray-400">Connected via Xverse</p>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-1 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition"
          >
            Disconnect
          </button>
        </div>
        
        {/* Show both addresses */}
        <div className="space-y-2 text-xs">
          {ordinalsAccount && (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <span className="text-green-400 font-semibold">🎨 Ordinals (Taproot)</span>
              <span className="font-mono text-white">{formatAddr(ordinalsAccount.address)}</span>
            </div>
          )}
          {paymentAccount && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span className="text-gray-400">💰 Payment</span>
              <span className="font-mono text-gray-300">{formatAddr(paymentAccount.address)}</span>
            </div>
          )}
          {!ordinalsAccount && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400">
              ⚠️ No Taproot address found! Ordinals cannot be received.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-center text-white mb-4 neon-text">
        Connect Wallet
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Xverse Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting || !isXverseInstalled}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            !isXverseInstalled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'btn-gradient'
          }`}
        >
          {isConnecting ? (
            <span className="animate-pulse">Connecting...</span>
          ) : (
            <>
              <span>⚡</span>
              <span>Xverse Wallet</span>
            </>
          )}
        </button>
        {!isXverseInstalled && (
          <p className="text-[10px] text-center text-gray-500">
            Xverse not detected.{' '}
            <a
              href="https://www.xverse.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hot-pink hover:underline"
            >
              Install Xverse
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
