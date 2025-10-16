import { DigiPayConfig, Transaction, MerchantMetadata, PiAuthResult } from './types';
import { DigiPayAPI } from './api';
import { MODAL_HTML, MODAL_STYLES, CURRENCY_SYMBOLS } from './templates';

export class DigiPay {
  private config: DigiPayConfig;
  private api: DigiPayAPI;
  private transaction: Transaction | null = null;
  private merchantData: MerchantMetadata | null = null;
  private piUser: PiAuthResult | null = null;
  private baseAmount: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  private overlay!: HTMLElement;
  private closeBtn!: HTMLButtonElement;
  private generateBtn!: HTMLButtonElement;
  private loginBtn!: HTMLButtonElement;
  private copyBtn!: HTMLButtonElement;
  private cancelBtn!: HTMLButtonElement;
  private closeSuccessBtn!: HTMLButtonElement;
  private closeErrorBtn!: HTMLButtonElement;
  private retryBtn!: HTMLButtonElement;
  private currencySelect!: HTMLSelectElement;
  private currencySelectAuth!: HTMLSelectElement;
  private backBtn!: HTMLButtonElement;
  private confirmBtn!: HTMLButtonElement;
  private explorerBtn!: HTMLButtonElement;
  private walletInput!: HTMLInputElement;
  private walletError!: HTMLElement;
  private logoutBtn!: HTMLButtonElement;
  private payNowBtn!: HTMLButtonElement;

  private loadingView!: HTMLElement;
  private authApprovalView!: HTMLElement;
  private authenticatedView!: HTMLElement;
  private initialView!: HTMLElement;
  private walletView!: HTMLElement;
  private successView!: HTMLElement;
  private errorView!: HTMLElement;

  constructor(config: DigiPayConfig) {
    this.config = {
      currency: 'PI',
      currencies: ['PI', 'USD', 'EUR', 'GBP'],
      ...config,
    };

    this.baseAmount = this.config.amount ? parseFloat(this.config.amount) : 0;
    this.api = new DigiPayAPI(this.config);
  }

  private renderModal(): void {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = MODAL_STYLES;
    document.head.appendChild(styleSheet);

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = MODAL_HTML;
    document.body.appendChild(modalContainer.firstElementChild!);

    this.initializeElements();
    this.initializeCurrencySelector();
    this.updateContent();
    this.bindEvents();
  }

  private initializeElements(): void {
    this.overlay = document.getElementById('digipayOverlay')!;
    this.closeBtn = document.getElementById('digipayClose') as HTMLButtonElement;
    this.generateBtn = document.getElementById('digipayGenerateBtn') as HTMLButtonElement;
    this.loginBtn = document.getElementById('digipayLoginBtn') as HTMLButtonElement;
    this.copyBtn = document.getElementById('digipayCopyBtn') as HTMLButtonElement;
    this.cancelBtn = document.getElementById('digipayCancelBtn') as HTMLButtonElement;
    this.closeSuccessBtn = document.getElementById('digipayCloseSuccessBtn') as HTMLButtonElement;
    this.closeErrorBtn = document.getElementById('digipayCloseErrorBtn') as HTMLButtonElement;
    this.retryBtn = document.getElementById('digipayRetryBtn') as HTMLButtonElement;
    this.currencySelect = document.getElementById('digipayCurrency') as HTMLSelectElement;
    this.currencySelectAuth = document.getElementById('digipayCurrencyAuth') as HTMLSelectElement;
    this.backBtn = document.getElementById('digipayBackBtn') as HTMLButtonElement;
    this.confirmBtn = document.getElementById('digipayConfirmBtn') as HTMLButtonElement;
    this.explorerBtn = document.getElementById('digipayExplorerBtn') as HTMLButtonElement;
    this.walletInput = document.getElementById('userWalletAddress') as HTMLInputElement;
    this.walletError = document.getElementById('walletAddressError')!;
    this.logoutBtn = document.getElementById('digipayLogoutBtn') as HTMLButtonElement;
    this.payNowBtn = document.getElementById('digipayPayNowBtn') as HTMLButtonElement;

    this.loadingView = document.getElementById('digipayLoadingView')!;
    this.authApprovalView = document.getElementById('digipayAuthApprovalView')!;
    this.authenticatedView = document.getElementById('digipayAuthenticatedView')!;
    this.initialView = document.getElementById('digipayInitialView')!;
    this.walletView = document.getElementById('digipayWalletView')!;
    this.successView = document.getElementById('digipaySuccessView')!;
    this.errorView = document.getElementById('digipayErrorView')!;
  }

  private initializeCurrencySelector(): void {
    this.config.currencies?.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency;
      option.textContent = currency;
      if (currency === this.config.currency) {
        option.selected = true;
      }
      this.currencySelect.appendChild(option);
    });

    this.config.currencies?.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency;
      option.textContent = currency;
      if (currency === this.config.currency) {
        option.selected = true;
      }
      this.currencySelectAuth.appendChild(option);
    });
  }

  private updateContent(): void {
    document.getElementById('digipayDescription')!.textContent = this.config.description || '';
    this.updateAmountDisplay();
  }

  private bindEvents(): void {
    this.closeBtn.onclick = () => this.close();
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    this.generateBtn.onclick = () => this.generateWalletAddress();
    this.loginBtn.onclick = () => this.login();
    this.logoutBtn.onclick = () => this.logout();
    this.payNowBtn.onclick = () => this.generateWalletAddressAuth();
    this.copyBtn.onclick = () => this.copyWalletAddress();
    this.cancelBtn.onclick = () => this.cancelPayment();
    this.closeSuccessBtn.onclick = () => this.close();
    this.closeErrorBtn.onclick = () => this.close();
    this.retryBtn.onclick = async () => await this.open();
    this.backBtn.onclick = () => this.goBack();
    this.confirmBtn.onclick = () => this.initiatePayment();
    this.explorerBtn.onclick = () => this.openExplorer();
    this.currencySelect.onchange = async (e) => {
      this.config.currency = (e.target as HTMLSelectElement).value;
      await this.updateAmountWithRates();
    };
    this.currencySelectAuth.onchange = async (e) => {
      this.config.currency = (e.target as HTMLSelectElement).value;
      await this.updateAmountWithRatesAuth();
    };

    this.walletInput.oninput = () => {
      this.validateWalletAddress(this.walletInput.value.trim());
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    this.validateWalletAddress(this.walletInput.value.trim());
  }

  private validateWalletAddress(address: string): void {
    const piAddressRegex = /^[A-Z0-9]{56}$/;
    const isValid = piAddressRegex.test(address);
    
    if (!address) {
      this.walletError.textContent = 'Pi wallet address is required';
      this.generateBtn.disabled = true;
      this.generateBtn.classList.add('disabled');
    } else if (!isValid) {
      this.walletError.textContent = 'Please enter a valid Pi wallet address (56 characters, uppercase letters and numbers only)';
      this.generateBtn.disabled = true;
      this.generateBtn.classList.add('disabled');
    } else {
      this.walletError.textContent = '';
      this.generateBtn.disabled = false;
      this.generateBtn.classList.remove('disabled');
    }
  }

  private showView(view: HTMLElement): void {
    this.loadingView.style.display = 'none';
    this.authApprovalView.style.display = 'none';
    this.authenticatedView.style.display = 'none';
    this.initialView.style.display = 'none';
    this.walletView.style.display = 'none';
    this.successView.style.display = 'none';
    this.errorView.style.display = 'none';
    view.style.display = 'block';
  }

  private setButtonLoading(button: HTMLButtonElement, isLoading: boolean): void {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  private updateAmountDisplay(): void {
    const symbol = CURRENCY_SYMBOLS[this.config.currency! as keyof typeof CURRENCY_SYMBOLS] || this.config.currency;
    document.getElementById('digipayAmount')!.textContent = symbol + ' ' + this.config.amount;
  }

  private async updateAmountWithRates(): Promise<void> {
    const amountElement = document.getElementById('digipayAmount')!;
    const skeletonElement = document.getElementById('digipayAmountSkeleton')!;

    amountElement.style.visibility = 'hidden';
    skeletonElement.style.display = 'block';

    try {
      const result = await this.api.convertAmount(
        this.baseAmount,
        'PI',
        this.config.currency || 'PI'
      );
      this.config.amount = result.convertedAmount.toFixed(2);
      this.updateAmountDisplay();
    } catch (error) {
      console.error('Error updating amount:', error);
    } finally {
      skeletonElement.style.display = 'none';
      amountElement.style.visibility = 'visible';
    }
  }

  private startTimer(): void {
    let timeLeft = 180;
    const timerElement = document.getElementById('digipayTimer')!;
    
    this.timer = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
      
      if (timeLeft <= 0) {
        if (this.timer) clearInterval(this.timer);
        this.cancelPayment();
      }
    }, 1000);
  }

  private async generateWalletAddress(): Promise<void> {
    this.setButtonLoading(this.generateBtn, true);

    try {
      const paymentIntent = await this.api.createPaymentIntent({
        amount: parseFloat(this.config.amount || '0'),
        currency: this.config.currency || 'PI',
        description: this.config.description,
        metadata: this.config.metadata,
        customer: this.config.customer,
      });

      this.transaction = paymentIntent;
      this.showView(this.walletView);

      const paymentDetails = document.getElementById('digipayPaymentDetails')!;
      const walletSkeleton = document.getElementById('digipayWalletSkeleton')!;
      paymentDetails.style.display = 'none';
      walletSkeleton.style.display = 'block';

      await new Promise(resolve => setTimeout(resolve, 1000));

      document.getElementById('digipayWalletAddressText')!.textContent = paymentIntent.paymentwalletaddress;
      document.getElementById('digipayWalletAmount')!.textContent =
        (CURRENCY_SYMBOLS[this.config.currency! as keyof typeof CURRENCY_SYMBOLS] || this.config.currency) + ' ' + this.config.amount;

      document.getElementById('digipayQRCode')!.setAttribute('src', paymentIntent.qrcodeurl);
      
      walletSkeleton.style.display = 'none';
      paymentDetails.style.display = 'block';
      
      this.startTimer();
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.setButtonLoading(this.generateBtn, false);
    }
  }

  private async login(): Promise<void> {
    if (!window.Pi) {
      this.handleError(new Error('Pi SDK not loaded'));
      return;
    }

    try {
      this.showView(this.authApprovalView);

      const scopes = ['username', 'payments', 'wallet_address'];
      const auth = await window.Pi.authenticate(scopes, this.handleIncompletePayment);

      this.piUser = auth;

      const customer = await this.api.signInCustomer(auth);

      document.getElementById('digipayAuthUsername')!.textContent = auth.user.username;
      document.getElementById('digipayAuthUid')!.textContent = auth.user.uid;
      document.getElementById('digipayMerchantNameAuth')!.textContent = this.merchantData!.name;
      document.getElementById('digipayDescriptionAuth')!.textContent = this.config.description || '';

      await this.updateAmountWithRatesAuth();

      this.showView(this.authenticatedView);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private async logout(): Promise<void> {
    if (!this.piUser) return;

    this.setButtonLoading(this.logoutBtn, true);
    this.payNowBtn.disabled = true;

    try {
      await this.api.signOutCustomer(this.piUser.user.uid);
      this.piUser = null;
      this.showView(this.initialView);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.setButtonLoading(this.logoutBtn, false);
      this.payNowBtn.disabled = false;
    }
  }

  private async generateWalletAddressAuth(): Promise<void> {
    if (!this.piUser) {
      this.handleError(new Error('User not authenticated'));
      return;
    }

    if (!window.Pi) {
      this.handleError(new Error('Pi SDK not loaded'));
      return;
    }

    this.setButtonLoading(this.payNowBtn, true);

    try {
      const paymentIntent = await this.api.createPaymentIntent({
        amount: parseFloat(this.config.amount || '0'),
        currency: this.config.currency || 'PI',
        description: this.config.description,
        metadata: this.config.metadata,
        customer: this.config.customer,
      });

      this.transaction = paymentIntent;

      const paymentData = {
        amount: this.transaction.amount,
        memo: this.config.description || 'Payment',
        metadata: {
          transactionRef: this.transaction.transactionref,
          piPaymentId: this.transaction.pipaymentid,
          ...this.config.metadata,
        },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: this.handlePaymentApproval,
        onReadyForServerCompletion: this.handlePaymentCompletion,
        onCancel: this.handlePaymentCancel,
        onError: this.handlePaymentError,
      });
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.setButtonLoading(this.payNowBtn, false);
    }
  }

  private async updateAmountWithRatesAuth(): Promise<void> {
    const amountElement = document.getElementById('digipayAmountAuth')!;
    const skeletonElement = document.getElementById('digipayAmountSkeletonAuth')!;

    amountElement.style.visibility = 'hidden';
    skeletonElement.style.display = 'block';

    try {
      const result = await this.api.convertAmount(
        this.baseAmount,
        'PI',
        this.config.currency || 'PI'
      );
      this.config.amount = result.convertedAmount.toFixed(2);
      const symbol = CURRENCY_SYMBOLS[this.config.currency! as keyof typeof CURRENCY_SYMBOLS] || this.config.currency;
      amountElement.textContent = symbol + ' ' + this.config.amount;
    } catch (error) {
      console.error('Error updating amount:', error);
    } finally {
      skeletonElement.style.display = 'none';
      amountElement.style.visibility = 'visible';
    }
  }

  private async initiatePayment(): Promise<void> {
    if (!window.Pi) {
      this.handleError(new Error('Pi SDK not loaded'));
      return;
    }

    if (!this.transaction) {
      this.handleError(new Error('No transaction found'));
      return;
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

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: this.handlePaymentApproval,
        onReadyForServerCompletion: this.handlePaymentCompletion,
        onCancel: this.handlePaymentCancel,
        onError: this.handlePaymentError,
      });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleIncompletePayment = (payment: any): void => {
    console.log('Incomplete payment:', payment);
  };

  private handlePaymentApproval = async (paymentId: string): Promise<void> => {
    if (!this.transaction) {
      this.handleError(new Error('No transaction found'));
      return;
    }

    try {
      const result = await this.api.approvePayment(
        this.transaction.transactionref,
        paymentId
      );
      this.transaction = result;

      document.getElementById('digipayWalletView')!.style.display = 'none';
      const verifyingState = document.getElementById('digipayVerifyingState')!;
      verifyingState.style.display = 'block';
    } catch (error: any) {
      this.handleError(error);
    }
  };

  private handlePaymentCompletion = async (paymentId: string, txid: string): Promise<void> => {
    if (!this.transaction) {
      this.handleError(new Error('No transaction found'));
      return;
    }

    try {
      const result = await this.api.completePayment(
        this.transaction.transactionref,
        txid
      );
      this.transaction = result;
      this.processPayment();
    } catch (error: any) {
      this.handleError(error);
    }
  };

  private handlePaymentCancel = (paymentId: string): void => {
    this.cancelPayment();
  };

  private handlePaymentError = (error: Error, payment?: any): void => {
    console.error('Payment error:', error, payment);
    this.handleError(error);
  };

  private processPayment(): void {
    if (this.timer) clearInterval(this.timer);

    if (this.transaction) {
      document.getElementById('digipayReference')!.textContent = this.transaction.transactionref;
    }

    this.showView(this.successView);
    if (this.config.onSuccess) {
      this.config.onSuccess(this.transaction!);
    }
  }

  private copyWalletAddress(): void {
    const walletAddress = document.getElementById('digipayWalletAddressText')!.textContent;
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      
      const originalText = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4CAF50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      setTimeout(() => {
        this.copyBtn.innerHTML = originalText;
      }, 2000);
    }
  }

  private openExplorer(): void {
    const explorerUrl = 'https://blockexplorer.minepi.com/tx/' + (this.transaction?.pitxid || '');
    window.open(explorerUrl, '_blank');
  }

  private goBack(): void {
    if (this.piUser) {
      this.showView(this.authenticatedView);
    } else {
      this.showView(this.initialView);
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private cancelPayment(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.close();
  }

  private handleError(error: Error): void {
    const message = error.message || 'Payment failed';
    document.getElementById('digipayErrorMessage')!.textContent = message;
    this.showView(this.errorView);
    if (this.config.onError) {
      this.config.onError(message);
    }
  }

  async open(): Promise<void> {
    if (!this.config.publicKey && !this.config.slug && !this.config.inv && !this.config.tranRef) {
      if (this.config.onError) {
        this.config.onError('One of publicKey, slug, inv, or tranRef is required');
      }
      return;
    }

    try {
      this.renderModal();
      this.overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.showView(this.loadingView);

      if (this.config.tranRef) {
        const transactionData = await this.api.fetchTransactionData(this.config.tranRef);

        if (transactionData.status === 'success') {
          this.close();
          if (this.config.onSuccess) {
            this.config.onSuccess({
              transactionref: transactionData.transactionref,
              amount: transactionData.amount,
              currency: transactionData.currency,
              status: transactionData.status,
              pipaymentid: transactionData.pipaymentid,
              paymentwalletaddress: '',
              qrcodeurl: '',
            });
          }
          return;
        }

        this.merchantData = {
          name: transactionData.merchantname,
          email: '',
          publickey: '',
          kycstatus: ''
        };

        this.transaction = {
          transactionref: transactionData.transactionref,
          amount: transactionData.amount,
          currency: transactionData.currency,
          status: transactionData.status,
          pipaymentid: transactionData.pipaymentid,
          paymentwalletaddress: '',
          qrcodeurl: '',
        };

        document.getElementById('digipayMerchantName')!.textContent = transactionData.merchantname;
        this.config.description = transactionData.description || 'Payment';
        this.baseAmount = transactionData.amount;
        this.config.amount = transactionData.amount.toString();
        this.config.currency = transactionData.currency;

        await this.updateAmountWithRates();
        await this.login();
        return;
      }

      if (this.config.publicKey) {
        const merchantData = await this.api.fetchMerchantMetadata();
        this.merchantData = merchantData;
        document.getElementById('digipayMerchantName')!.textContent = merchantData.name;
      } else if (this.config.slug) {
        const paymentLinkData = await this.api.fetchPaymentLinkData(this.config.slug);
        this.merchantData = {
          name: paymentLinkData.merchant.name,
          email: paymentLinkData.merchant.email,
          publickey: '',
          kycstatus: ''
        };
        document.getElementById('digipayMerchantName')!.textContent = paymentLinkData.title;
        this.config.description = paymentLinkData.description || this.config.description;
        if (paymentLinkData.amount > 0) {
          this.baseAmount = paymentLinkData.amount;
          this.config.amount = paymentLinkData.amount.toString();
        }
        this.config.currency = paymentLinkData.currency;
      } else if (this.config.inv) {
        const invoiceData = await this.api.fetchInvoiceData(this.config.inv);
        this.merchantData = {
          name: invoiceData.merchant.name,
          email: invoiceData.merchant.email,
          publickey: '',
          kycstatus: ''
        };
        document.getElementById('digipayMerchantName')!.textContent = `Invoice from ${invoiceData.merchant.name}`;
        this.config.description = this.config.description || `Invoice Payment`;
        this.baseAmount = invoiceData.totalAmount;
        this.config.amount = invoiceData.totalAmount.toString();
        this.config.currency = invoiceData.currency;
      }

      await this.updateAmountWithRates();
      this.showView(this.initialView);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private close(): void {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.transaction = null;
    this.merchantData = null;
    this.piUser = null;
    this.walletInput.value = '';

    if (this.config.onCancel) {
      this.config.onCancel();
    }

    const modalElement = document.getElementById('digipayOverlay');
    if (modalElement && modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
    }
  }
}