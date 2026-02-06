import React from 'react';

interface AgeVerificationProps {
  onVerified: () => void;
}

export const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const handleYes = () => {
    // Speichere in localStorage damit User nicht jedes Mal bestätigen muss
    localStorage.setItem('ageVerified', 'true');
    onVerified();
  };

  const handleNo = () => {
    // Weiterleitung zu Google
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-hot-pink/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-neon-blue/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 glass-card p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🔞</div>
        
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-neon-blue mb-4">
          Age Verification
        </h1>
        
        <p className="text-gray-300 mb-8">
          This website contains adult content. You must be at least 18 years old to enter.
        </p>

        <p className="text-white font-bold text-lg mb-6">
          Are you 18 years or older?
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleYes}
            className="btn-gradient px-8 py-3 text-lg font-bold"
          >
            ✓ YES, I'm 18+
          </button>
          
          <button
            onClick={handleNo}
            className="px-8 py-3 text-lg font-bold bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition"
          >
            ✗ NO
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          By entering, you confirm that you are of legal age in your jurisdiction.
        </p>
      </div>
    </div>
  );
};
