# @digipay-sdk/inline-js

Official JavaScript SDK for DigiPay - Accept Pi Network payments in your application.

## Installation

```bash
npm install @digipay-sdk/inline-js
```

or

```bash
yarn add @digipay-sdk/inline-js
```

or

```bash
pnpm add @digipay-sdk/inline-js
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
import { DigiPay } from '@digipay-sdk/inline-js';

const digiPay = new DigiPay({
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
  },
  onCancel: () => {
    console.log('Payment cancelled');
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  }
});

digiPay.open();
```

### React Example

```jsx
import { DigiPay } from '@digipay-sdk/inline-js';

function PaymentButton() {
  const handlePayment = () => {
    const digiPay = new DigiPay({
      publicKey: process.env.NEXT_PUBLIC_DIGIPAY_PUBLIC_KEY,
      amount: '49.99',
      description: 'Premium Package',
      customer: {
        email: 'user@example.com',
        name: 'John Doe'
      },
      metadata: {
        orderId: 'xxxxxxxx'
      },
      onSuccess: (transaction) => {
        alert('Payment successful! Ref: ' + transaction.transactionref);
      },
      onError: (error) => {
        alert('Payment failed: ' + error);
      }
    });

    digiPay.open();
  };

  return (
    <button onClick={handlePayment}>
      Pay with Pi
    </button>
  );
}
```

### Next.js Example

```jsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { DigiPay } from '@digipay-sdk/inline-js';

export default function CheckoutPage() {
  const [piLoaded, setPiLoaded] = useState(false);

  const handlePayment = () => {
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

    digiPay.open();
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

#### `open(): Promise<void>`
Opens the payment modal and handles the entire payment flow:
- Fetches merchant metadata and validates the public key
- Displays payment modal with order summary and currency selector
- Shows "Login with Pi" button for user authentication (optional)
- Allows user to enter wallet address or use authenticated Pi UID
- Creates payment intent when user proceeds
- Initiates Pi payment flow when user confirms

**Note:** Authentication with Pi Network happens when the user clicks the "Login with Pi" button in the modal, not automatically on open.

#### `close(): void`
Closes the payment modal and resets the state.

## Environment Variables

For Next.js/React apps, add to your `.env.local`:

```env
NEXT_PUBLIC_DIGIPAY_PUBLIC_KEY=pk_live_xxxxxxxxx
```

## Testing

Use sandbox mode for testing:

```javascript
Pi.init({ version: "2.0", sandbox: true });
```

## Support

- Documentation: https://docs.digipay.com
- Issues: https://github.com/digipay-sdk/inline-js/issues
- Email: support@digipay.com

## License

MIT
