import React, { useState, useEffect } from 'react';

interface MintData {
  id: string;
  minterAddress: string;
  trainerName: string;
  inscriptionId: string;
  txid: string;
  price: number;
  timestamp: string;
}

interface AdminPanelProps {
  adminAddress: string;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminAddress, onClose }) => {
  const [mints, setMints] = useState<MintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMints();
  }, []);

  const fetchMints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mints', {
        headers: {
          'X-Admin-Address': adminAddress,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch mints');
      }
      
      const data = await response.json();
      setMints(data.mints || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.open(`/api/mints?format=csv&adminAddress=${adminAddress}`, '_blank');
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '-';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">🔐 Admin Panel - Mint Log</h2>
          <div className="flex gap-2">
            <button
              onClick={fetchMints}
              className="px-3 py-1 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
            >
              📥 Download CSV
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading mints...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Error: {error}</p>
              <button
                onClick={fetchMints}
                className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Try Again
              </button>
            </div>
          ) : mints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No mints yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Trainer</th>
                    <th className="pb-2 pr-4">Minter</th>
                    <th className="pb-2 pr-4">Price</th>
                    <th className="pb-2 pr-4">TXID</th>
                    <th className="pb-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mints.map((mint, index) => (
                    <tr key={mint.id} className="border-b border-white/5 text-white">
                      <td className="py-2 pr-4 text-gray-500">{mints.length - index}</td>
                      <td className="py-2 pr-4 font-semibold" style={{ color: '#FF69B4' }}>
                        {mint.trainerName}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {formatAddress(mint.minterAddress)}
                      </td>
                      <td className="py-2 pr-4">{mint.price} sats</td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {mint.txid && mint.txid !== 'pending' ? (
                          <a
                            href={`https://mempool.space/tx/${mint.txid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-blue hover:underline"
                          >
                            {formatAddress(mint.txid)}
                          </a>
                        ) : (
                          <span className="text-gray-500">pending</span>
                        )}
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {formatDate(mint.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Total Mints: <span className="text-white font-bold">{mints.length}</span> | 
            Total Revenue: <span className="text-green-400 font-bold">{mints.reduce((sum, m) => sum + (m.price || 0), 0).toLocaleString()} sats</span>
          </p>
        </div>
      </div>
    </div>
  );
};
