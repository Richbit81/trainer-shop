import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletType, WalletAccount, WalletState } from '../types';
import {
  isUnisatInstalled,
  isXverseInstalled,
  connectUnisat,
  connectXverse,
  getUnisatAccounts,
} from '../utils/wallet';

interface WalletContextType {
  walletState: WalletState;
  connect: (walletType: WalletType) => Promise<WalletAccount[]>;
  disconnect: () => void;
  checkWalletConnection: () => Promise<void>;
  isUnisatInstalled: boolean;
  isXverseInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    walletType: null,
    accounts: [],
    connected: false,
    network: 'mainnet',
  });

  const checkWalletConnection = useCallback(async () => {
    try {
      const unisatAccounts = await getUnisatAccounts();
      if (unisatAccounts.length > 0) {
        setWalletState({
          walletType: 'unisat',
          accounts: unisatAccounts,
          connected: true,
          network: 'mainnet',
        });
        return;
      }
    } catch (err) {
      // Ignore errors on auto-connect
    }
  }, []);

  useEffect(() => {
    checkWalletConnection();

    if (isUnisatInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletState(prev => ({
            ...prev,
            accounts: accounts.map(addr => ({ address: addr })),
            connected: true,
            walletType: 'unisat',
          }));
        } else {
          setWalletState({
            walletType: null,
            accounts: [],
            connected: false,
            network: 'mainnet',
          });
        }
      };

      window.unisat?.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.unisat?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [checkWalletConnection]);

  const connect = useCallback(async (walletType: WalletType) => {
    try {
      let accounts: WalletAccount[] = [];

      if (walletType === 'unisat') {
        accounts = await connectUnisat();
      } else if (walletType === 'xverse') {
        accounts = await connectXverse();
      } else {
        throw new Error('Invalid wallet type');
      }

      setWalletState({
        walletType,
        accounts,
        connected: true,
        network: 'mainnet',
      });

      return accounts;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({
      walletType: null,
      accounts: [],
      connected: false,
      network: 'mainnet',
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletState,
        connect,
        disconnect,
        checkWalletConnection,
        isUnisatInstalled: isUnisatInstalled(),
        isXverseInstalled: isXverseInstalled(),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
