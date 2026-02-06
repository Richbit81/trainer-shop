import React from 'react';
import type { TrainerItem } from '../types';
import { WalletConnect } from '../components/WalletConnect';
import { TrainerCard } from '../components/TrainerCard';

// Die 3 Trainer-Ordinals
const TRAINERS: TrainerItem[] = [
  {
    id: 'cum-trainer',
    name: 'Cum Trainer',
    inscriptionId: 'c1eeef12fd60553d15b3b77afaa521d9b0382957e168333f5c28e70b225732b8i0',
    description: 'Interactive HTML Ordinal - An exclusive training experience on Bitcoin.',
    price: 5000, // 5,000 sats
  },
  {
    id: 'gag-trainer',
    name: 'Gag Trainer',
    inscriptionId: '217bb301e32c4dd77f9e0a193f76f941d466a28a22d632755f90fce27e47aeebi0',
    description: 'Interactive HTML Ordinal - Master the art with this unique trainer.',
    price: 5000, // 5,000 sats
  },
  {
    id: 'squirt-trainer',
    name: 'Squirt Trainer',
    inscriptionId: '73901824d5c9b590a7b27bdda37ee4372acf1f4c36a429ed04dead590f020373i0',
    description: 'Interactive HTML Ordinal - Advanced training techniques encoded on-chain.',
    price: 5000, // 5,000 sats
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-hot-pink/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-neon-blue/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-hot-pink/10 to-neon-blue/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-pink to-neon-blue mb-4 tracking-tight">
            TRAINER SHOP
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Exclusive interactive HTML Ordinals on Bitcoin. Each trainer is a unique 
            delegate inscription permanently stored on the blockchain.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Powered by UniSat API</span>
          </div>
        </header>

        {/* Wallet Connect Section */}
        <div className="max-w-md mx-auto mb-12">
          <WalletConnect />
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRAINERS.map(trainer => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>

        {/* Footer Info */}
        <footer className="mt-16 text-center">
          <div className="glass-card inline-block px-8 py-4">
            <p className="text-sm text-gray-400 mb-2">
              💡 <span className="text-white font-semibold">How it works:</span>
            </p>
            <ol className="text-xs text-gray-500 space-y-1">
              <li>1. Connect your Xverse wallet</li>
              <li>2. Select a trainer and click "Mint Now"</li>
              <li>3. Choose your fee rate and confirm the payment</li>
              <li>4. Your delegate inscription is created on Bitcoin!</li>
            </ol>
          </div>

          <div className="mt-8 text-xs text-gray-600">
            <p>Each trainer costs 5,000 sats + inscription fees</p>
            <p className="mt-1">
              <a
                href="https://ordinals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-hot-pink hover:text-light-pink transition"
              >
                View on Ordinals.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
