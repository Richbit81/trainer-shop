import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { walletState, connect, disconnect, isXverseInstalled } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await connect('xverse');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletState.connected) {
    const displayAddress = walletState.accounts[0]?.address;
    const shortAddress = displayAddress
      ? `${displayAddress.substring(0, 6)}...${displayAddress.substring(displayAddress.length - 4)}`
      : '';

    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-xs text-gray-400">Connected via Xverse</p>
              <p className="text-sm font-mono text-white">{shortAddress}</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-1 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition"
          >
            Disconnect
          </button>
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
