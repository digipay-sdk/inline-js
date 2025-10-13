# @digipay/inline-js

Official JavaScript SDK for DigiPay - Accept Pi Network payments in your application.

## Installation

```bash
npm install @digipay/inline-js
```

or

```bash
yarn add @digipay/inline-js
```

or

```bash
pnpm add @digipay/inline-js
```

## Prerequisites

Make sure to include the Pi Network SDK in your HTML:

```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
<script>
  Pi.init({ version: "2.0", sandbox: true }); // Use sandbox: false in production
</script>
```

## Usage

### Basic Example

```javascript
import { DigiPay } from '@digipay/inline-js';

const digiPay = new DigiPay({
  apiUrl: 'https://api.digipay.com/api/v1',
  publicKey: 'pk_live_xxxxxxxxx',
  description: 'Premium Package Subscription',
  amount: '49.99',
  currency: 'PI',
  metadata: {
    orderId: '1234567890',
    userId: 'user_abc123'
  },
  customer: {
    email: 'customer@example.com',
    name: 'John Doe'
  },
  onSuccess: (transaction) => {
    console.log('Payment successful!', transaction);
    // Handle successful payment
  },
  onCancel: () => {
    console.log('Payment cancelled');
    // Handle cancellation
  },
  onError: (error) => {
    console.error('Payment failed:', error);
    // Handle error
  }
});

// Initialize and create payment
async function processPayment() {
  try {
    // Initialize (fetches merchant data)
    await digiPay.initialize();

    // Authenticate user with Pi Network
    const auth = await digiPay.authenticateWithPi();
    console.log('User authenticated:', auth.user);

    // Create payment intent
    const transaction = await digiPay.createPayment();
    console.log('Transaction created:', transaction);

    // Initiate Pi payment flow
    await digiPay.initiatePayment();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call when user clicks "Pay with Pi"
processPayment();
```

### React Example

```jsx
import { useState } from 'react';
import { DigiPay } from '@digipay/inline-js';

function PaymentButton() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    const digiPay = new DigiPay({
      apiUrl: 'https://api.digipay.com/api/v1',
      publicKey: process.env.NEXT_PUBLIC_DIGIPAY_PUBLIC_KEY,
      amount: '49.99',
      description: 'Premium Package',
      onSuccess: (transaction) => {
        alert('Payment successful! Ref: ' + transaction.transactionref);
        setLoading(false);
      },
      onError: (error) => {
        alert('Payment failed: ' + error);
        setLoading(false);
      }
    });

    try {
      await digiPay.initialize();
      await digiPay.authenticateWithPi();
      await digiPay.createPayment();
      await digiPay.initiatePayment();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Pi'}
    </button>
  );
}
```

### Next.js Example

```jsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { DigiPay } from '@digipay/inline-js';

export default function CheckoutPage() {
  const [piLoaded, setPiLoaded] = useState(false);

  const handlePayment = async () => {
    const digiPay = new DigiPay({
      publicKey: process.env.NEXT_PUBLIC_DIGIPAY_PUBLIC_KEY!,
      amount: '49.99',
      description: 'Premium Package',
      customer: {
        email: 'user@example.com',
        name: 'John Doe'
      },
      onSuccess: (transaction) => {
        console.log('Payment successful!', transaction);
      }
    });

    try {
      await digiPay.initialize();
      await digiPay.authenticateWithPi();
      await digiPay.createPayment();
      await digiPay.initiatePayment();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        onLoad={() => {
          if (window.Pi) {
            window.Pi.init({ version: '2.0', sandbox: true });
            setPiLoaded(true);
          }
        }}
      />

      <button onClick={handlePayment} disabled={!piLoaded}>
        Pay with Pi
      </button>
    </>
  );
}
```

## API Reference

### Configuration Options

```typescript
interface DigiPayConfig {
  apiUrl?: string;              // DigiPay API URL (default: http://localhost:5000/api/v1)
  publicKey: string;            // Your DigiPay public key (required)
  description?: string;         // Payment description
  amount: string;               // Payment amount
  currency?: string;            // Currency code (default: 'PI')
  currencies?: string[];        // Available currencies (default: ['PI', 'USD', 'EUR', 'GBP'])
  metadata?: Record<string, any>; // Custom metadata
  customer?: {
    email?: string;
    name?: string;
  };
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}
```

### Methods

#### `initialize(): Promise<void>`
Fetches merchant metadata and validates the public key.

#### `authenticateWithPi(): Promise<PiAuthResult>`
Authenticates the user with Pi Network and requests necessary permissions.

#### `createPayment(): Promise<Transaction>`
Creates a payment intent on the backend.

#### `initiatePayment(): Promise<void>`
Initiates the Pi Network payment flow. This opens the Pi payment dialog.

#### `convertCurrency(targetCurrency: string): Promise<number>`
Converts the payment amount to the target currency.

#### `getTransaction(): Transaction | null`
Returns the current transaction object.

#### `getMerchantData(): MerchantMetadata | null`
Returns the merchant metadata.

#### `getPiUser(): PiAuthResult | null`
Returns the authenticated Pi user data.

## Environment Variables

For Next.js/React apps, add to your `.env.local`:

```env
NEXT_PUBLIC_DIGIPAY_PUBLIC_KEY=pk_live_xxxxxxxxx
NEXT_PUBLIC_DIGIPAY_API_URL=https://api.digipay.com/api/v1
```

## Testing

Use sandbox mode for testing:

```javascript
Pi.init({ version: "2.0", sandbox: true });
```

## Support

- Documentation: https://docs.digipay.com
- Issues: https://github.com/digipay/inline-js/issues
- Email: support@digipay.com

## License

MIT
