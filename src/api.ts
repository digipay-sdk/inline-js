import { DigiPayConfig, Transaction, MerchantMetadata, CurrencyRatesResponse } from './types';

export class DigiPayAPI {
  private apiUrl: string = 'http://localhost:3003/api/v1';
  private publicKey: string;

  constructor(config: DigiPayConfig) {
    this.publicKey = config.publicKey;
  }

  async fetchMerchantMetadata(): Promise<MerchantMetadata> {
    const response = await fetch(`${this.apiUrl}/merchant/metadata`, {
      method: 'GET',
      headers: {
        'x-public-key': this.publicKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to fetch merchant metadata');
    }

    return response.json();
  }

  async getCurrencyRates(baseCurrency: string = 'PI'): Promise<CurrencyRatesResponse> {
    const response = await fetch(`${this.apiUrl}/currency/rates?base=${baseCurrency}`);

    if (!response.ok) {
      throw new Error('failed to fetch rates');
    }

    return response.json();
  }

  async convertAmount(
    amount: number,
    from: string,
    to: string
  ): Promise<{ convertedAmount: number }> {
    const response = await fetch(
      `${this.apiUrl}/currency/convert?amount=${amount}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      throw new Error('failed to convert amount');
    }

    return response.json();
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
    customer?: { email?: string; name?: string };
  }): Promise<Transaction> {
    const response = await fetch(`${this.apiUrl}/payment/inline-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': this.publicKey,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to create payment');
    }

    return response.json();
  }

  async completePayment(transactionRef: string, txid: string): Promise<Transaction> {
    const response = await fetch(`${this.apiUrl}/payment/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionRef,
        txid,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete payment on backend');
    }

    return response.json();
  }
}