import React from 'react';
import { MintingStatus } from '../types';

interface MintingProgressProps {
  status: MintingStatus;
}

export const MintingProgress: React.FC<MintingProgressProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-neon-blue';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressColor = () => {
    switch (status.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-gradient-to-r from-hot-pink to-neon-blue';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${getStatusColor()}`}>
          {status.status === 'idle' && '⏳ Ready'}
          {status.status === 'pending' && '⏳ Pending...'}
          {status.status === 'processing' && '🔄 Processing...'}
          {status.status === 'completed' && '✅ Complete!'}
          {status.status === 'failed' && '❌ Failed'}
        </span>
        <span className="text-xs text-gray-400">{status.progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* Message */}
      {status.message && (
        <p className="text-xs text-gray-300">{status.message}</p>
      )}

      {/* Error */}
      {status.error && (
        <p className="text-xs text-red-400">{status.error}</p>
      )}

      {/* Success Details */}
      {status.status === 'completed' && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          {status.inscriptionId && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Inscription:</span>
              <a
                href={`https://ordinals.com/inscription/${status.inscriptionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-hot-pink hover:text-light-pink font-mono truncate max-w-[200px]"
              >
                {status.inscriptionId.substring(0, 20)}...
              </a>
            </div>
          )}
          {status.txid && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Transaction:</span>
              <a
                href={`https://mempool.space/tx/${status.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neon-blue hover:text-dodger-blue font-mono truncate max-w-[200px]"
              >
                {status.txid.substring(0, 20)}...
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
