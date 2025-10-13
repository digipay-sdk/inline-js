import { DigiPayConfig, Transaction, MerchantMetadata, PiAuthResult } from './types';
import { DigiPayAPI } from './api';

export class DigiPay {
  private config: DigiPayConfig;
  private api: DigiPayAPI;
  private transaction: Transaction | null = null;
  private merchantData: MerchantMetadata | null = null;
  private piUser: PiAuthResult | null = null;
  private baseAmount: number;

  constructor(config: DigiPayConfig) {
    this.config = {
      apiUrl: 'http://localhost:5000/api/v1',
      currency: 'PI',
      currencies: ['PI', 'USD', 'EUR', 'GBP'],
      ...config,
    };

    this.baseAmount = parseFloat(this.config.amount);
    this.api = new DigiPayAPI(this.config);
  }

  async initialize(): Promise<void> {
    if (!this.config.publicKey) {
      throw new Error('Public key is required');
    }

    try {
      this.merchantData = await this.api.fetchMerchantMetadata();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initialize payment');
    }
  }

  async convertCurrency(targetCurrency: string): Promise<number> {
    try {
      const result = await this.api.convertAmount(
        this.baseAmount,
        'PI',
        targetCurrency
      );
      return result.convertedAmount;
    } catch (error) {
      throw new Error('Failed to convert currency');
    }
  }

  async createPayment(): Promise<Transaction> {
    try {
      const transaction = await this.api.createPaymentIntent({
        amount: parseFloat(this.config.amount),
        currency: this.config.currency || 'PI',
        description: this.config.description,
        metadata: this.config.metadata,
        customer: this.config.customer,
      });

      this.transaction = transaction;
      return transaction;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  async authenticateWithPi(): Promise<PiAuthResult> {
    if (!window.Pi) {
      throw new Error('Pi SDK not loaded. Please use this in Pi Browser.');
    }

    try {
      const scopes = ['username', 'payments', 'wallet_address'];

      const onIncompletePaymentFound = (payment: any) => {
        console.log('Incomplete payment found:', payment);
      };

      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      this.piUser = auth;
      return auth;
    } catch (error: any) {
      throw new Error(error.message || 'Pi authentication failed');
    }
  }

  async initiatePayment(): Promise<void> {
    if (!window.Pi) {
      throw new Error('Pi SDK not loaded. Please use this in Pi Browser.');
    }

    if (!this.transaction) {
      throw new Error('No transaction found. Please create payment first.');
    }

    try {
      const paymentData = {
        amount: this.transaction.amount,
        memo: this.config.description || 'Payment',
        metadata: {
          transactionRef: this.transaction.transactionref,
          piPaymentId: this.transaction.pipaymentid,
          ...this.config.metadata,
        },
      };

      const paymentCallbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment ready for approval:', paymentId);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
          await this.completePayment(txid);
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          if (this.config.onCancel) {
            this.config.onCancel();
          }
        },
        onError: (error: Error, payment?: any) => {
          console.error('Payment error:', error, payment);
          if (this.config.onError) {
            this.config.onError(error.message || 'Payment failed');
          }
        },
      };

      await window.Pi.createPayment(paymentData, paymentCallbacks);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initiate payment');
    }
  }

  async completePayment(txid: string): Promise<void> {
    if (!this.transaction) {
      throw new Error('No transaction found');
    }

    try {
      const result = await this.api.completePayment(
        this.transaction.transactionref,
        txid
      );

      this.transaction = result;

      if (this.config.onSuccess) {
        this.config.onSuccess(result);
      }
    } catch (error: any) {
      if (this.config.onError) {
        this.config.onError(
          error.message || 'Failed to verify payment. Please contact support.'
        );
      }
      throw error;
    }
  }

  getTransaction(): Transaction | null {
    return this.transaction;
  }

  getMerchantData(): MerchantMetadata | null {
    return this.merchantData;
  }

  getPiUser(): PiAuthResult | null {
    return this.piUser;
  }
}
