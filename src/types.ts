export interface DigiPayConfig {
  apiUrl?: string;
  publicKey: string;
  description?: string;
  amount: string;
  currency?: string;
  currencies?: string[];
  metadata?: Record<string, any>;
  customer?: {
    email?: string;
    name?: string;
  };
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export interface Transaction {
  transactionref: string;
  amount: number;
  currency: string;
  status: string;
  pipaymentid: string;
  paymentwalletaddress: string;
  qrcodeurl: string;
}

export interface MerchantMetadata {
  name: string;
  email: string;
  publickey: string;
  kycstatus: string;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
  symbol: string;
}

export interface CurrencyRatesResponse {
  base: string;
  rates: CurrencyRate[];
  timestamp: number;
}

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: any) => void
  ) => Promise<PiAuthResult>;
  createPayment: (
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => Promise<any>;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}
