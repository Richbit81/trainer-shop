import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { HomePage } from './pages/HomePage';
import { AgeVerification } from './components/AgeVerification';
import './index.css';

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Prüfe ob User bereits verifiziert ist
    const verified = localStorage.getItem('ageVerified') === 'true';
    setIsAgeVerified(verified);
  }, []);

  // Loading state
  if (isAgeVerified === null) {
    return null;
  }

  // Zeige Altersverifikation wenn nicht verifiziert
  if (!isAgeVerified) {
    return <AgeVerification onVerified={() => setIsAgeVerified(true)} />;
  }

  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
