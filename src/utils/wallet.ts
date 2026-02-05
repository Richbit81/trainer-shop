import type { WalletAccount } from '../types';

declare global {
  interface Window {
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      switchNetwork: (network: 'livenet' | 'testnet') => Promise<void>;
      getNetwork: () => Promise<'livenet' | 'testnet'>;
      sendBitcoin: (to: string, amount: number) => Promise<string>;
      signPsbt: (psbtHex: string, options?: { autoFinalized?: boolean }) => Promise<string>;
      pushPsbt: (psbtHex: string) => Promise<string>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    BitcoinProvider?: {
      request: (method: string, params?: any) => Promise<any>;
    };
  }
}

export const isUnisatInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.unisat !== 'undefined';
};

export const isXverseInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.BitcoinProvider !== 'undefined';
};

export const connectUnisat = async (): Promise<WalletAccount[]> => {
  if (!isUnisatInstalled()) {
    throw new Error('UniSat Wallet is not installed. Please install the UniSat browser extension.');
  }

  try {
    if (!window.unisat || typeof window.unisat.requestAccounts !== 'function') {
      throw new Error('UniSat Wallet is detected but the connection API is not available.');
    }

    const accounts = await window.unisat.requestAccounts();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned. Please unlock your UniSat Wallet and try again.');
    }

    const network = await window.unisat.getNetwork();
    
    if (network !== 'livenet') {
      throw new Error('Please switch to Bitcoin Mainnet in your UniSat Wallet.');
    }

    return accounts.map(addr => ({ address: addr }));
  } catch (error: any) {
    if (error.message && error.message.includes('User rejected')) {
      throw new Error('Connection rejected. Please approve the connection request.');
    }
    throw new Error(error.message || 'Error connecting to UniSat Wallet.');
  }
};

export const connectXverse = async (): Promise<WalletAccount[]> => {
  if (!isXverseInstalled()) {
    throw new Error('Xverse Wallet is not installed. Please install the Xverse browser extension.');
  }

  try {
    let satsConnect: any;
    try {
      satsConnect = await import('sats-connect');
    } catch (importError: any) {
      throw new Error(`Failed to load sats-connect: ${importError.message}`);
    }
    
    if (!satsConnect || !satsConnect.request) {
      throw new Error('sats-connect could not be loaded.');
    }
    
    const response = await satsConnect.request('wallet_connect', null);

    if (response.status === 'success') {
      const addresses = response.result?.addresses || [];
      
      if (!addresses || addresses.length === 0) {
        throw new Error('No addresses returned from Xverse Wallet');
      }

      const accounts: WalletAccount[] = [];
      
      const ordinalsAddress = addresses.find((addr: any) => addr.purpose === 'ordinals');
      const paymentAddress = addresses.find((addr: any) => addr.purpose === 'payment');

      if (ordinalsAddress && ordinalsAddress.address) {
        accounts.push({
          address: ordinalsAddress.address,
          publicKey: ordinalsAddress.publicKey,
          purpose: 'ordinals'
        });
      }
      
      if (paymentAddress && paymentAddress.address) {
        accounts.push({
          address: paymentAddress.address,
          publicKey: paymentAddress.publicKey,
          purpose: 'payment'
        });
      }

      if (accounts.length === 0) {
        throw new Error('No valid addresses found.');
      }

      return accounts;
    } else {
      if (response.error?.code === 'USER_REJECTION') {
        throw new Error('Connection cancelled by user.');
      }
      throw new Error(response.error?.message || 'Failed to connect to Xverse Wallet');
    }
  } catch (error: any) {
    if (error.message && (error.message.includes('User rejected') || error.message.includes('rejected'))) {
      throw new Error('Connection rejected. Please approve the connection request.');
    }
    throw new Error(error.message || 'Error connecting to Xverse Wallet.');
  }
};

export const getUnisatAccounts = async (): Promise<WalletAccount[]> => {
  if (!isUnisatInstalled()) {
    return [];
  }

  try {
    const accounts = await window.unisat!.getAccounts();
    return accounts.map(addr => ({ address: addr }));
  } catch {
    return [];
  }
};

export const sendBitcoinViaUnisat = async (to: string, amountSats: number): Promise<string> => {
  if (!isUnisatInstalled()) {
    throw new Error('UniSat Wallet not found');
  }

  if (!window.unisat || typeof window.unisat.sendBitcoin !== 'function') {
    throw new Error('UniSat sendBitcoin function is not available.');
  }

  try {
    const txid = await window.unisat.sendBitcoin(to, amountSats);
    return txid;
  } catch (error: any) {
    if (error?.message?.includes('User rejected') || error?.code === 4001) {
      throw new Error('Payment was cancelled. Please approve the transaction.');
    }
    throw new Error(error?.message || 'Error sending Bitcoin via UniSat');
  }
};

export const sendBitcoinViaXverse = async (to: string, amountSats: number): Promise<string> => {
  if (!isXverseInstalled()) {
    throw new Error('Xverse Wallet not found');
  }

  try {
    const satsConnect = await import('sats-connect');
    
    if (satsConnect && satsConnect.request) {
      const response = await satsConnect.request('sendTransfer', {
        recipients: [{ address: to, amount: amountSats }],
        network: { type: 'Mainnet' }
      });
      
      if (response.status === 'success') {
        const txid = response.result?.txid || response.result?.txId;
        if (txid) return txid;
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Xverse payment failed');
      }
    }

    throw new Error('Failed to send via Xverse');
  } catch (error: any) {
    if (error.message && (error.message.includes('User rejected') || error.message.includes('cancelled'))) {
      throw new Error('Payment was cancelled. Please approve the transaction.');
    }
    throw new Error(error.message || 'Error sending Bitcoin via Xverse');
  }
};

export const sendMultipleBitcoinPayments = async (
  recipients: Array<{ address: string; amount: number }>,
  walletType: 'unisat' | 'xverse'
): Promise<string> => {
  if (recipients.length === 0) {
    throw new Error('No recipients provided');
  }

  // Convert BTC amounts to sats if needed
  const recipientsInSats = recipients.map(r => ({
    address: r.address,
    amount: r.amount < 1 ? Math.round(r.amount * 100000000) : r.amount
  }));

  if (walletType === 'xverse') {
    if (!isXverseInstalled()) {
      throw new Error('Xverse Wallet not found');
    }

    try {
      const satsConnect = await import('sats-connect');
      
      if (satsConnect && satsConnect.request) {
        const response = await satsConnect.request('sendTransfer', {
          recipients: recipientsInSats,
          network: { type: 'Mainnet' }
        });
        
        if (response.status === 'success') {
          const txid = response.result?.txid || response.result?.txId;
          if (txid) return txid;
        }
        
        if (response.error) {
          throw new Error(response.error.message || 'Xverse payment failed');
        }
      }

      throw new Error('Failed to send via Xverse');
    } catch (error: any) {
      if (error.message && error.message.includes('User rejected')) {
        throw new Error('Payment was cancelled. Please approve the transaction.');
      }
      throw error;
    }
  } else {
    // UniSat - process payments sequentially
    let lastTxid = '';
    for (const recipient of recipientsInSats) {
      lastTxid = await sendBitcoinViaUnisat(recipient.address, recipient.amount);
    }
    return lastTxid;
  }
};
