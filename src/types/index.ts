export interface WalletAccount {
  address: string;
  publicKey?: string;
  purpose?: 'ordinals' | 'payment';
}

export type WalletType = 'unisat' | 'xverse' | null;

export interface WalletState {
  walletType: WalletType;
  accounts: WalletAccount[];
  connected: boolean;
  network: 'mainnet' | 'testnet';
}

export interface TrainerItem {
  id: string;
  name: string;
  inscriptionId: string;
  description: string;
  price: number; // in sats
}

export interface MintingStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  inscriptionId?: string;
  txid?: string;
  paymentTxid?: string;
  message?: string;
  error?: string;
}
