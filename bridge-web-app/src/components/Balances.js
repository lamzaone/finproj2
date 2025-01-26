import React, { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { ethers } from 'ethers';

const Balances = ({ ethereumAddress, suiAddress, suiPackageId, ethContractABI, ethereumIBTAddress }) => {
  const [ethereumBalance, setEthereumBalance] = useState('0');
  const [suiBalance, setSuiBalance] = useState('0');
  const suiClient = useSuiClient();

  // Fetch Ethereum IBT token balance
  useEffect(() => {
    if (ethereumAddress && ethereumIBTAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(ethereumIBTAddress, ethContractABI, provider);

      contract.balanceOf(ethereumAddress)
        .then((balance) => {
          setEthereumBalance(ethers.utils.formatUnits(balance, 18)); // Convert balance to IBT tokens (18 decimals)
        })
        .catch((error) => {
          console.error('Error fetching Ethereum IBT balance:', error);
          setEthereumBalance('Error');
        });
    }
  }, [ethereumAddress, ethereumIBTAddress, ethContractABI]);

  // Fetch Sui IBT token balance
  useEffect(() => {
    if (suiAddress && suiPackageId) {
      console.log('Fetching balance for Sui address:', suiAddress);
      suiClient.getBalance({
        owner: suiAddress,
        coinType: `${suiPackageId}::ibt::IBT`, // Use your IBT token type
      })
      .then((balance) => {
        console.log('Sui balance response:', balance);
        // Convert balance to human-readable format (assuming 18 decimals)
        const formattedBalance = ethers.utils.formatUnits(balance.totalBalance, 18);
        setSuiBalance(formattedBalance);
      })
      .catch((error) => {
        console.error('Error fetching Sui IBT balance:', error);
        setSuiBalance('Error');
      });
    }
  }, [suiAddress, suiClient, suiPackageId]);

  return (
    <div className="balances">
      <p>Ethereum IBT Balance: {ethereumBalance}</p>
      <p>Sui IBT Balance: {suiBalance}</p>
    </div>
  );
};

export default Balances;