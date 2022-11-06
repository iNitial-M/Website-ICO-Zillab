import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import detectEthereumProvider from '@metamask/detect-provider';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Web3 from 'web3';
import mainAbi from '../contracts/abi/erc20.json';
import minimalAbi from '../contracts/abi/minimalAbi.json';
import presaleAbi from '../contracts/abi/presale.json';
import { SnackbarService } from '../shared/snackbar.service';
import { AppConstants } from '../shared/utils/constants';
import {WalletConnectService} from "../../services/wallet-connect.service";
import {ActivatedRoute} from "@angular/router";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {faLock} from "@fortawesome/free-solid-svg-icons";
import {faWallet} from "@fortawesome/free-solid-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faTelegram } from '@fortawesome/free-brands-svg-icons';


type Token = {
  address: string;
  token: string;
  balance: string;
  parityRate: string;
  image: string;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  faTelegram = faTelegram;
  faFilePdf = faFilePdf;
  faLock = faLock;
  faWallet = faWallet;
  faArrowRightFromBracket = faArrowRightFromBracket;
  tokenAddresses = [
    {
      address: '',
      token: 'BNB',
      balance: '0',
      parityRate: '0',
      image: 'url(assets/images/7192.png)',
    },
    {
      address: environment.aAddress,
      token: 'USDT',
      balance: '0',
      parityRate: '0',
      image: 'url(assets/images/x.png)',
    },
  ] as Token[];

  provider!: any;

  loadingSubject = new Subject<boolean>();

  loading = false;
  metamaskConnected = false;

  account!: string;
  web3!: Web3;

  tokenBuyForm!: FormGroup;
  lockedTokenAmount!: string;

  presaleContract!: any;
  isValidKYC!: boolean;
  walletAddress!: string;
  endTime = environment.preSaleEndDate;
  environment = environment;

  constructor(
    public readonly snackbar: SnackbarService,
    private readonly fb: FormBuilder,
    private walletConnectService: WalletConnectService,
    private activatedRoute: ActivatedRoute
  ) {
    this.tokenBuyForm = this.fb.group({
      fromTokenSelect: new FormControl(
        { value: 'BNB', disabled: !this.metamaskConnected || this.loading },
        Validators.required
      ),
      fromTokenInput: new FormControl(
        {
          value: null,
          disabled: !this.metamaskConnected || this.loading,
        },
        Validators.required
      ),
      toTokenSelect: [{ value: 'X', disabled: true }],
      toTokenInput: new FormControl(
        {
          value: null,
          disabled: this.shouldBuyFormInputDisable(),
        },
        Validators.required
      ),
    });
  }

  // to check if metamask not loggedin
  ngOnInit(): void {
    this.loadingSubject.subscribe((result) => {
      this.loading = result;
      this.enableOrDisableBuyFormInputs(result);
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      let wallet = params['wallet'];
      this.walletAddress = wallet;
      if (this.walletAddress) {
        localStorage.setItem('wallet', this.walletAddress);
      }
    });

    // this.walletConnectService.isValidKYC(this.walletAddress).then(
    //   (res: any) => { // Success
    //     this.isValidKYC = res.authorized;
    //   }
    // )

    this.connectWallet();
  }

  ngOnDestroy(): void {
    if (this.provider) {
      this.provider.disconnect();
    }
  }

  connectOrBuyText(): string {
    return this.metamaskConnected ? 'Buy Token' : 'Connect to Wallet';
  }

  getSelectedTokenImage(name: string): string | undefined {
    return this.getSavedToken(name)?.image;
  }

  changeSelectFromToken(tokenName: string): void {
    const token = this.getSavedToken(tokenName);
    this.fromTokenInputControl?.setValue(token?.balance);
    this.toTokenInputControl?.setValue(
      this.calculateParityFromTo(token?.parityRate, token?.balance)
    );
  }

  fromInputChange(value: string): void {
    const token = this.getSavedToken(this.fromTokenSelectControl?.value);
    this.toTokenInputControl?.setValue(
      this.calculateParityFromTo(token?.parityRate, value)
    );
  }

  toInputChange(value: string): void {
    const token = this.getSavedToken(this.fromTokenSelectControl?.value);
    this.fromTokenInputControl?.setValue(
      this.calculateParityToFrom(token?.parityRate, value)
    );
  }

  calculateFiftyPercent(event: any): void {
    event.preventDefault();
    const balance = this.web3.utils.toWei(
      this.selectedToken?.balance as string
    );
    if (balance) {
      const val = this.web3.utils
        .fromWei(this.web3.utils.toBN(balance).divn(2))
        .toString();
      this.fromTokenInputControl?.setValue(val);
      this.fromInputChange(val);
    }
  }

  calculateMax(event: any): void {
    event.preventDefault();
    const balance = this.selectedToken?.balance as string;
    if (balance) {
      this.fromTokenInputControl?.setValue(balance);
    }
    this.fromInputChange(balance);
  }

  keyPressNumbersWithDecimal(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  connectWalletOrBuy(): void {
    if (this.metamaskConnected) {
      this.buyToken();
    }

    if (!this.metamaskConnected) {
      this.connectWallet();
    }
  }

  get selectedToken(): Token | undefined {
    return this.getSavedToken(this.fromTokenSelectControl?.value);
  }

  get fromTokenSelectControl(): AbstractControl | null {
    return this.tokenBuyForm.get('fromTokenSelect');
  }

  get fromTokenInputControl(): AbstractControl | null {
    return this.tokenBuyForm.get('fromTokenInput');
  }

  get toTokenInputControl(): AbstractControl | null {
    return this.tokenBuyForm.get('toTokenInput');
  }

  private shouldBuyFormInputDisable(): boolean {
    return !this.metamaskConnected || this.loading;
  }

  private enableOrDisableBuyFormInputs(isDisable: boolean): void {
    if (isDisable || !this.metamaskConnected) {
      this.fromTokenInputControl?.disable();
      this.fromTokenSelectControl?.disable();
      this.toTokenInputControl?.disable();
    } else {
      this.fromTokenInputControl?.enable();
      this.fromTokenSelectControl?.enable();
      this.toTokenInputControl?.enable();
    }
  }

  public clearStorage() {
    localStorage.clear();
  }

  private calculateParityToFrom(
    parityRate: string | undefined,
    value: string | undefined
  ): number {
    if (!parityRate || !value) {
      return 0;
    }
    return Number.parseFloat(value) * Number.parseFloat(parityRate);
  }

  private calculateParityFromTo(
    parityRate: string | undefined,
    value: string | undefined
  ): number {
    if (!parityRate || !value) {
      return 0;
    }
    return Number.parseFloat(value) / Number.parseFloat(parityRate);
  }

  private getSavedToken(tokenName: string): Token | undefined {
    return this.tokenAddresses.find((token) => token.token === tokenName);
  }

  private connectWallet = async () => {
    this.loadingSubject.next(true);
    this.provider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    if (this.provider) {
      try {
        const accounts = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        if (accounts) {
          this.metamaskConnected = true;
        }

        this.account = accounts[0];

        this.web3 = new Web3(this.provider);

        const networkId = await this.web3.eth.net.getId();
        if (environment.bscNetworkId !== networkId) {
          try {
            await this.provider.request({
              method: 'wallet_switchEthereumChain',
              params: [
                { chainId: this.web3.utils.toHex(environment.bscNetworkId) },
              ],
            });
            window.location.reload();
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await this.provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: this.web3.utils.toHex(environment.bscNetworkId),
                      chainName: 'Binance Smart Chain Mainnet',
                      nativeCurrency: {
                        name: 'BNB',
                        decimals: 18,
                        symbol: 'BNB',
                      },
                      rpcUrls: ['https://bsc-dataseed2.binance.org'],
                    },
                  ],
                });
                window.location.reload();
              } catch (addError) {
                this.snackbar.error('Please add BNB Mainnet Network', 'OK');
              }
            }
          }
          return;
        }

        this.presaleContract = new this.web3.eth.Contract(
          presaleAbi as any,
          environment.presaleAddress
        );

        this.fetchBuyersAmount();

        const bnbBalanceResponse = await this.web3.eth.getBalance(this.account);
        const bnbBalance = this.web3.utils.fromWei(bnbBalanceResponse); //formatBalance(

        this.tokenAddresses.forEach(async (token) => {
          if (token.token === 'BNB') {
            token.balance = bnbBalance;
            const rateOfNativeCurrencyResponse =
              await this.presaleContract.methods.rate().call();
            token.parityRate = this.web3.utils.fromWei(
              rateOfNativeCurrencyResponse
            );
            this.changeSelectFromToken(token.token);
            return;
          }

          const contract = new this.web3.eth.Contract(
            minimalAbi as any,
            token.address
          );
          const tokenBalance = await contract.methods
            .balanceOf(this.account)
            .call();

          token.balance = this.web3.utils.fromWei(tokenBalance);

          // TODO format 6 decimal
          //token.balance = formatBalance(weiBalance);

          const rateOfToken = await this.presaleContract.methods
            .tokenPrices(token.address)
            .call();
          token.parityRate = this.web3.utils.fromWei(rateOfToken);
        });
      } catch (e) {
        this.snackbar.error(
          'Metamask grant failed! Please login in MetaMask',
          'OK'
        );
        console.error(e);
      }
    } else {
      const snackRef = this.snackbar.error('Please install MetaMask', 'OK');
      snackRef.afterDismissed().subscribe(() => {
        window.open('https://metamask.io', '_blank');
      });
    }
    this.loadingSubject.next(false);
  };

  private fetchBuyersAmount = async () => {
    const lockedTokenBalance: any = await this.presaleContract.methods
      .buyersAmount(this.account)
      .call();
    this.lockedTokenAmount = this.web3.utils.fromWei(
      this.web3.utils.toBN(lockedTokenBalance['amount'])
    );
  };

  private buyToken = async () => {
    this.loadingSubject.next(true);
    try {
      const selectedToken = this.getSavedToken(
        this.fromTokenSelectControl?.value
      );

      const tokenContract = new this.web3.eth.Contract(
        mainAbi as any,
        selectedToken?.address
      );

      if (selectedToken?.token !== 'BNB') {
        const approved = await tokenContract.methods
          .approve(
            environment.presaleAddress,
            this.fromTokenInputControl?.value +
              '0'.repeat(AppConstants.TOKEN_DECIMAL)
          )
          .send({ from: this.account });
        console.log(approved);
        this.snackbar.success('Spend approved', 'OK');
      }

      if (selectedToken?.token === 'BNB') {
        await this.presaleContract.methods
          .buyToken(
            AppConstants.ZERO_ADDRESS,
            '0'.repeat(AppConstants.TOKEN_DECIMAL)
          )
          .send({
            from: this.account,
            value: this.web3.utils.toWei(
              this.fromTokenInputControl?.value.toString(),
              'ether'
            ),
          });
      } else {
        await this.presaleContract.methods
          .buyToken(
            selectedToken?.address,
            this.fromTokenInputControl?.value +
              '0'.repeat(AppConstants.TOKEN_DECIMAL)
          )
          .send({ from: this.account });
      }

      this.snackbar.success('Presale was successful', '');
      this.fetchBuyersAmount();

      this.tokenAddresses.forEach(async (token) => {
        if (!token.address) {
          const bnbBalanceResponse = await this.web3.eth.getBalance(
            this.account
          );
          const bnbBalance = this.web3.utils.fromWei(bnbBalanceResponse);

          /* TODO decimal format const bnbBalance = formatBalance(
            this.web3.utils.fromWei(bnbBalanceResponse)
          );*/
          token.balance = bnbBalance;
          return;
        }
        const contract = new this.web3.eth.Contract(
          minimalAbi as any,
          token.address
        );
        const tokenBalance = await contract.methods
          .balanceOf(this.account)
          .call();

        const balance = this.web3.utils.fromWei(tokenBalance);
        token.balance = balance;
      });
    } catch (error: any) {
      console.log(error);
      this.snackbar.error('Signing failed, please try again!', 'OK');
    } finally {
      this.loadingSubject.next(false);
    }
  };
}
