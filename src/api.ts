import { DigiPayConfig, Transaction, MerchantMetadata, CurrencyRatesResponse } from './types';

export class DigiPayAPI {
  private apiUrl: string = 'http://localhost:3003/api/v1';
  private publicKey?: string;
  private slug?: string;
  private inv?: string;
  private tranRef?: string;

  constructor(config: DigiPayConfig) {
    const providedParams = [config.publicKey, config.slug, config.inv, config.tranRef].filter(Boolean).length;

    if (providedParams === 0) {
      throw new Error('One of publicKey, slug, inv, or tranRef must be provided');
    }
    if (providedParams > 1) {
      throw new Error('Cannot provide more than one of publicKey, slug, inv, or tranRef');
    }

    this.publicKey = config.publicKey;
    this.slug = config.slug;
    this.inv = config.inv;
    this.tranRef = config.tranRef;
  }

  async fetchMerchantMetadata(): Promise<MerchantMetadata> {
    if (this.publicKey) {
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

      const result = await response.json();
      return result.data;
    }

    throw new Error('Public key required for fetching merchant metadata');
  }

  async fetchPaymentLinkData(slug: string): Promise<{
    slug: string;
    title: string;
    amount: number;
    currency: string;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    customFields?: any[];
    merchant: {
      name: string;
      email: string;
    };
  }> {
    const response = await fetch(`${this.apiUrl}/payment-link/slug/${slug}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to fetch payment link');
    }

    const result = await response.json();
    return result.data;
  }

  async fetchInvoiceData(inv: string): Promise<{
    slug: string;
    totalAmount: number;
    currency: string;
    merchant: {
      name: string;
      email: string;
    };
  }> {
    const response = await fetch(`${this.apiUrl}/invoice/slug/${inv}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to fetch invoice');
    }

    const result = await response.json();
    return result.data;
  }

  async fetchTransactionData(tranRef: string): Promise<{
    transactionref: string;
    amount: number;
    currency: string;
    status: string;
    pipaymentid: string;
    description?: string;
    merchantname: string;
    createdat: string;
  }> {
    const response = await fetch(`${this.apiUrl}/payment/checkout/${tranRef}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to fetch transaction');
    }

    const result = await response.json();
    return result.data;
  }

  async getCurrencyRates(baseCurrency: string = 'PI'): Promise<CurrencyRatesResponse> {
    const response = await fetch(`${this.apiUrl}/currency/rates?base=${baseCurrency}`);

    if (!response.ok) {
      throw new Error('failed to fetch rates');
    }

    const result = await response.json();
    return result.data;
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

    const result = await response.json();
    return result.data;
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
    customer?: { email?: string; name?: string };
    customFieldsData?: Record<string, any>;
  }): Promise<Transaction> {
    if (this.slug) {
      const response = await fetch(`${this.apiUrl}/payment/inline-intent-slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: this.slug,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          metadata: data.metadata,
          customer: data.customer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'failed to create payment');
      }

      const result = await response.json(); 
      return result.data;
    }

    if (this.inv) {
      const response = await fetch(`${this.apiUrl}/payment/inline-intent-inv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inv: this.inv,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          metadata: data.metadata,
          customer: data.customer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'failed to create payment');
      }

      const result = await response.json();
      return result.data;
    }

    const response = await fetch(`${this.apiUrl}/payment/inline-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': this.publicKey!,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'failed to create payment');
    }

    const result = await response.json();
    return result.data;
  }

  async approvePayment(transactionRef: string, paymentId: string): Promise<Transaction> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.publicKey) {
      headers['x-public-key'] = this.publicKey;
    }

    const response = await fetch(`${this.apiUrl}/payment/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transactionRef,
        paymentId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve payment');
    }

    const result = await response.json();
    return result.data;
  }

  async completePayment(transactionRef: string, txid: string): Promise<Transaction> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.publicKey) {
      headers['x-public-key'] = this.publicKey;
    }

    const response = await fetch(`${this.apiUrl}/payment/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transactionRef,
        txid,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete payment');
    }

    const result = await response.json();
    return result.data;
  }

  async signInCustomer(authResult: {
    accessToken: string;
    user: {
      uid: string;
      username: string;
    };
  }): Promise<{ uid: string; username: string; lastAuthenticatedAt: Date }> {
    if (this.tranRef) {
      const response = await fetch(`${this.apiUrl}/customer/signin-tranref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tranRef: this.tranRef, authResult }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (this.slug) {
      const response = await fetch(`${this.apiUrl}/customer/signin-slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: this.slug, authResult }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (this.inv) {
      const response = await fetch(`${this.apiUrl}/customer/signin-inv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inv: this.inv, authResult }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (!this.publicKey) {
      throw new Error('Public key required for customer sign in');
    }

    const response = await fetch(`${this.apiUrl}/customer/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': this.publicKey,
      },
      body: JSON.stringify({ authResult }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sign in customer');
    }

    const result = await response.json();
    return result.data;
  }

  async signOutCustomer(piUserId: string): Promise<void> {
    if (this.tranRef) {
      const response = await fetch(`${this.apiUrl}/customer/signout-tranref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tranRef: this.tranRef, piUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign out customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (this.slug) {
      const response = await fetch(`${this.apiUrl}/customer/signout-slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: this.slug, piUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign out customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (this.inv) {
      const response = await fetch(`${this.apiUrl}/customer/signout-inv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inv: this.inv, piUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign out customer');
      }

      const result = await response.json();
      return result.data;
    }

    if (!this.publicKey) {
      throw new Error('Public key required for customer sign out');
    }

    const response = await fetch(`${this.apiUrl}/customer/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': this.publicKey,
      },
      body: JSON.stringify({ piUserId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sign out customer');
    }

    const result = await response.json();
    return result.data;
  }
}