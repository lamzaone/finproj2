import React from 'react';
import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { ethers } from 'ethers';

const ConnectWallets = ({ onEthereumConnect, onSuiConnect }) => {
  const { mutate: connectSuiWallet, isPending, isError, error } = useConnectWallet();
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();

  const connectMetaMask = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('MetaMask Wallet Connected:', address);
      onEthereumConnect(address);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const connectSui = async () => {
    if (!wallets || wallets.length === 0) {
      alert('No Sui Wallets detected. Please install a Sui Wallet extension.');
      return;
    }

    const wallet = wallets.find((w) => w.name === 'Sui Wallet');
    if (!wallet) {
      alert('Sui Wallet not found. Please ensure it is installed and enabled.');
      return;
    }

    try {
      connectSuiWallet(
        { wallet },
        {
          onSuccess: (data) => {
            const address = data?.accounts?.[0]?.address || currentAccount?.address;
            if (address) {
              console.log('Sui Wallet Connected:', address);
              onSuiConnect(address);
            } else {
              console.error('Connected to Sui Wallet, but no account data found.');
              alert('Connected to Sui Wallet, but no account data found.');
            }
          },
          onError: (err) => {
            console.error('Failed to connect Sui Wallet:', err);
            alert('Failed to connect Sui Wallet. Please try again.');
          },
        }
      );
    } catch (err) {
      console.error('Error during Sui Wallet connection:', err);
    }
  };

  return (
    <div className="connect-wallets">
      <button onClick={connectMetaMask} className="button metamask">
        Connect MetaMask
      </button>
      <button onClick={connectSui} className="button sui" disabled={isPending}>
        {isPending ? 'Connecting...' : 'Connect Sui Wallet'}
      </button>
      {isError && <p className="error">Failed to connect Sui Wallet: {error.message}</p>}
    </div>
  );
};

export default ConnectWallets;