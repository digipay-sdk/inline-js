export const CURRENCY_SYMBOLS = {
  PI: 'π',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const MODAL_HTML = `
  <div class="digipay-overlay" id="digipayOverlay">
    <div class="digipay-modal">
      <div class="digipay-modal-content">
        <div class="digipay-header">
          <div class="digipay-close" id="digipayClose">&times;</div>
        </div>
        <div class="digipay-body">
          <div id="digipayLoadingView" style="display: none;">
            <div class="digipay-section digipay-loading-content">
              <div class="digipay-spinner"></div>
            </div>
          </div>

          <div id="digipayInitialView">
            <div class="digipay-section">
              <div class="digipay-section-header">
                <h2>Order Summary</h2>
                <div class="digipay-currency-selector">
                  <select id="digipayCurrency" class="digipay-select"></select>
                </div>
              </div>

              <div class="digipay-merchant">
                <div class="digipay-merchant-logo">
                  <span>D</span>
                </div>
                <div class="digipay-merchant-info">
                  <h3 id="digipayMerchantName"></h3>
                  <p id="digipayDescription"></p>
                </div>
              </div>
              
              <div class="digipay-amount-wrapper">
                <div class="digipay-amount">
                  <span id="digipayAmount"></span>
                </div>
                <div class="digipay-amount-skeleton" id="digipayAmountSkeleton"></div>
              </div>
            </div>
            <div class="digipay-section">
              <div class="digipay-secure">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5V13h-5v-3.5C9.5 8.1 10.6 7 12 7zm0 10c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"></path>
                </svg>
                <span>Secure Payment</span>
              </div>
              <div class="digipay-wallet-input">
                <label for="userWalletAddress">Your Pi Wallet Address</label>
                <div class="digipay-input-group">
                  <input type="text" id="userWalletAddress" placeholder="Enter your Pi wallet address" class="digipay-input" />
                  <div class="digipay-input-error" id="walletAddressError"></div>
                </div>
              </div>
              <button class="digipay-button primary" id="digipayGenerateBtn" disabled>
                <span class="digipay-btn-content">Proceed to Payment</span>
                <div class="digipay-btn-spinner" style="display: none;"></div>
              </button>
              <button class="digipay-button secondary" id="digipayLoginBtn">
                Login with Pi
              </button>
            </div>
          </div>

          <div id="digipayWalletView" style="display: none;">
            <div class="digipay-section">
              <div class="digipay-wallet-header">
                <button class="digipay-back-btn" id="digipayBackBtn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                  Back
                </button>
                <h2>Payment Details</h2>
              </div>

              <div id="digipayWalletSkeleton" class="digipay-wallet-skeleton">
                <div class="skeleton-line"></div>
                <div class="skeleton-box"></div>
              </div>

              <div id="digipayPaymentDetails" style="display: none;">
                <div class="digipay-timer">
                  Time remaining: <span id="digipayTimer">03:00</span>
                </div>

                <div class="digipay-wallet-address">
                  <p>Send exactly <span class="digipay-amount-highlight" id="digipayWalletAmount"></span> to:</p>
                  <div class="digipay-qr-section">
                    <div class="digipay-qr-code">
                      <img id="digipayQRCode" alt="Payment QR Code" />
                      <div class="digipay-qr-label">Scan QR Code</div>
                    </div>
                  </div>
                  <div class="digipay-address-box">
                    <code id="digipayWalletAddressText"></code>
                    <button class="digipay-copy-btn" id="digipayCopyBtn">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="digipay-wallet-actions">
                  <button class="digipay-button primary" id="digipayConfirmBtn">
                    I've sent the payment
                  </button>
                  <button class="digipay-button secondary" id="digipayCancelBtn">
                    Cancel Payment
                  </button>
                </div>
              </div>

              <div id="digipayVerifyingState" class="digipay-verifying" style="display: none;">
                <div class="digipay-verifying-spinner"></div>
                <p>Verifying payment...</p>
              </div>
            </div>
          </div>

          <div id="digipaySuccessView" style="display: none;">
            <div class="digipay-section digipay-success-content">
              <div class="digipay-success-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="#4CAF50" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2>Payment Successful!</h2>
              <p class="digipay-success-text">Your transaction has been confirmed.</p>
              <p class="digipay-reference">Reference: <span id="digipayReference"></span></p>
              <button class="digipay-button primary" id="digipayExplorerBtn">
                <svg class="pi-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                View on Pi Explorer
              </button>
              <button class="digipay-button secondary" id="digipayCloseSuccessBtn">
                Close
              </button>
            </div>
          </div>

          <div id="digipayErrorView" style="display: none;">
            <div class="digipay-section digipay-error-content">
              <div class="digipay-error-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h2>Payment Failed</h2>
              <p class="digipay-error-text" id="digipayErrorMessage"></p>
              <button class="digipay-button primary" id="digipayRetryBtn">
                Try Again
              </button>
              <button class="digipay-button secondary" id="digipayCloseErrorBtn">
                Close
              </button>
            </div>
          </div>

          <div class="digipay-footer-center">
            <div class="digipay-brand">
              <span>Powered by</span>
              <div class="digipay-logo">
                <span>D</span>
              </div>
              <span>Digimart Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export const MODAL_STYLES = `
  .digipay-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    animation: digipayFadeIn 0.3s ease-out;
  }
  
  .digipay-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  
  .digipay-modal-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .digipay-modal-content::-webkit-scrollbar {
    display: none;
  }
  
  .digipay-header {
    display: flex;
    justify-content: flex-end;
  }
  
  .digipay-close {
    cursor: pointer;
    font-size: 24px;
    color: #666;
  }
  
  .digipay-section {
    margin: 16px 0;
  }

  .digipay-section:first-child {
    margin-top: 0;
  }

  .digipay-section:last-child {
    margin-bottom: 0;
  }
  
  .digipay-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .digipay-section-header h2 {
    font-size: 24px;
    font-weight: bold;
    color: #0A0F1C;
    margin: 0;
  }
  
  .digipay-merchant {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 16px;
  }
  
  .digipay-merchant-logo {
    width: 48px;
    height: 48px;
    background: #0A0F1C;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F3B641;
    font-weight: bold;
    font-size: 24px;
  }
  
  .digipay-merchant-info h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .digipay-merchant-info p {
    color: #666;
    margin: 0;
  }

  .digipay-amount-wrapper {
    margin-top: 16px;
    position: relative;
    min-height: 40px;
  }

  .digipay-amount {
    font-size: 32px;
    font-weight: bold;
    display: inline-block;
  }

  .digipay-amount-skeleton {
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    min-width: 160px;
    background: #e0e0e0;
    border-radius: 8px;
    display: none;
    animation: skeletonPulse 1.5s ease-in-out infinite;
  }
  
  .digipay-secure {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .digipay-wallet-input {
    margin-bottom: 24px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 4px;
  }

  .digipay-wallet-input label {
    display: block;
    margin-bottom: 8px;
    color: #0A0F1C;
    font-weight: 500;
    font-size: 14px;
  }

  .digipay-input-group {
    position: relative;
    width: 100%;
  }

  .digipay-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    box-sizing: border-box;
    font-family: monospace;
  }

  .digipay-input:focus {
    outline: none;
    border-color: #F3B641;
  }

  .digipay-input-error {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
    min-height: 20px;
  }
  
  .digipay-button {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .digipay-button.primary {
    background: #F3B641;
    color: #0A0F1C;
  }
  
  .digipay-button.primary:hover {
    background: #E5A93C;
  }
  
  .digipay-button.secondary {
    background: white;
    color: #0A0F1C;
    border: 2px solid #eee;
  }
  
  .digipay-button.secondary:hover {
    background: #f9f9f9;
  }

  .digipay-button.disabled,
  .digipay-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .digipay-button .digipay-btn-content {
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .digipay-button.loading .digipay-btn-content {
    opacity: 0;
  }

  .digipay-button.loading .digipay-btn-spinner {
    display: block;
  }

  .digipay-wallet-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .digipay-back-btn {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .digipay-back-btn:hover {
    background: #f5f5f5;
    color: #0A0F1C;
  }

  .digipay-wallet-skeleton {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 12px;
    margin: 16px 0;
    animation: skeletonPulse 1.5s ease-in-out infinite;
  }

  .skeleton-line {
    height: 20px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 16px;
    width: 60%;
  }

  .skeleton-box {
    height: 48px;
    background: #e0e0e0;
    border-radius: 8px;
    width: 100%;
  }

  .digipay-wallet-address {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 12px;
    margin: 16px 0;
    animation: fadeIn 0.3s ease-out;
  }

  .digipay-qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid #eee;
  }

  .digipay-qr-code {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .digipay-qr-code img {
    width: 200px;
    height: 200px;
    border-radius: 8px;
  }

  .digipay-qr-label {
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }

  .digipay-address-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 12px;
    border-radius: 8px;
    margin-top: 8px;
    border: 1px solid #eee;
  }

  .digipay-address-box code {
    flex: 1;
    font-family: monospace;
    word-break: break-all;
  }

  .digipay-copy-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #666;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .digipay-copy-btn:hover {
    background: #f5f5f5;
    color: #0A0F1C;
  }

  .digipay-timer {
    background: #FFF4E5;
    color: #B76E00;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .digipay-amount-highlight {
    font-weight: 600;
    color: #0A0F1C;
  }

  .digipay-wallet-actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .digipay-verifying {
    text-align: center;
    padding: 32px 0;
    animation: fadeIn 0.3s ease-out;
  }

  .digipay-verifying-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #4CAF50;
    border-top: 3px solid transparent;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: digipaySpinner 1s linear infinite;
  }

  .digipay-success-content {
    text-align: center;
    padding: 32px 0;
  }

  .digipay-success-icon {
    margin-bottom: 24px;
  }

  .digipay-success-text {
    color: #4CAF50;
    font-size: 18px;
    margin: 16px 0;
  }

  .digipay-reference {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    font-family: monospace;
    margin: 24px 0;
  }

  .digipay-error-content {
    text-align: center;
    padding: 32px 0;
  }

  .digipay-error-icon {
    margin-bottom: 24px;
  }

  .digipay-error-text {
    color: #dc3545;
    font-size: 16px;
    margin: 16px 0;
    padding: 16px;
    background: #fff5f5;
    border-radius: 8px;
    border: 1px solid #dc3545;
  }

  .digipay-footer-center {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    color: #666;
    padding-bottom: 16px;
  }
  
  .digipay-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .digipay-logo {
    width: 24px;
    height: 24px;
    background: #0A0F1C;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F3B641;
    font-weight: bold;
    font-size: 12px;
  }

  .pi-icon {
    margin-right: 8px;
  }

  #digipayExplorerBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .digipay-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
  }

  .digipay-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #F3B641;
    border-radius: 50%;
    margin-bottom: 16px;
    animation: digipaySpinner 1s linear infinite;
  }

  .digipay-btn-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #0A0F1C;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: digipaySpinner 1s linear infinite;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }

  .digipay-currency-selector {
    position: relative;
  }

  .digipay-select {
    appearance: none;
    background: white;
    border: 1px solid #eee;
    padding: 8px 32px 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
  }

  .digipay-select:hover {
    border-color: #F3B641;
  }

  .digipay-currency-selector::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #666;
    pointer-events: none;
  }

  @keyframes digipaySpinner {
    0% { transform: translateY(-50%) rotate(0deg); }
    100% { transform: translateY(-50%) rotate(360deg); }
  }

  @keyframes digipayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes skeletonPulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
