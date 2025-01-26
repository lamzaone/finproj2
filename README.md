# Introduction to Blockchain Technologies final project
### Stanciu Denis - West University of Timisoara, Informatics, year III

## Introduction:
This is a simple web application that bridges two tokens (smart contracts) deployed on SUI and Ethereum blockchain. The contracts are both mint-able and burn-able by the owner only. The application connects to the MetaMask (using ethers library) and SUI (using Mysten's dApps kit) wallets (browser extensions), fetches your Wallet IDs, and checks the amount of IBT tokens available in each of the accounts.

## Instructions:
### 1. Web application:
- Install NPM (node package manager)
- Navigate to `bridge-web-app` folder - ```cd bridge-web-app```
- Install all the dependencies
```cli
npm install
```
- Run the web application
```cli
npm start
```

### 2. Anvil, SUI documentations
- For Anvil (Ethereum localchain) and SUI documentations, please see the documentations below:
  - https://book.getfoundry.sh/anvil/  - **ETHEREUM**
  - https://docs.sui.io/references/cli/client - **SUI**
  - https://docs.metamask.io/wallet/ - **ETHEREUM WALLET**
  -  https://sdk.mystenlabs.com/dapp-kit  -  **dApps Kit for SUI wallet integration**