import React, { useState } from 'react';
import {
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { ethers } from 'ethers';
import { bcs } from '@mysten/bcs';

const TransferForm = ({
  ethereumAddress,
  suiAddress,
  suiPackageId,
  ethContractABI,
  ethereumIBTAddress,
  treasuryCapObjectId,
}) => {
  const [amount, setAmount] = useState('');
  const [sourceChain, setSourceChain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Helper function to convert Sui address to 20-byte vector
  const suiAddressTo20Bytes = (suiAddress) => {
    // Remove the '0x' prefix and convert to a byte array
    const bytes = Array.from(Buffer.from(suiAddress.slice(2), 'hex'));

    // Truncate to 20 bytes (Ethereum address length)
    return bytes.slice(0, 20);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!currentAccount) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(amount, 18); // Parse amount to 18 decimals
      const suiAmount = BigInt(parsedAmount.toString()); // Convert to BigInt for Sui

      setIsLoading(true);

      // Fetch gas payment objects for Sui
      const gasPaymentObjects = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: '0x2::sui::SUI', // Fetch SUI coins for gas payment
      });

      if (gasPaymentObjects.data.length === 0) {
        throw new Error('No gas payment objects found in the wallet.');
      }

      // Use the first gas payment object
      const gasPaymentObject = gasPaymentObjects.data[0];

      if (sourceChain === 'ethereum') {
        // Ethereum to Sui transfer
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethSigner = ethProvider.getSigner();
        const ethContract = new ethers.Contract(ethereumIBTAddress, ethContractABI, ethSigner);

        // Step 1: Burn tokens on Ethereum
        const gasPrice = await ethProvider.getGasPrice();
        const gasLimit = ethers.utils.hexlify(300000); // Adjust gas limit as needed

        const burnTx = await ethContract.burn(ethereumAddress, parsedAmount, {
          gasPrice,
          gasLimit,
        });
        await burnTx.wait();
        console.log('Ethereum Burn Transaction:', burnTx);

        // Step 2: Mint tokens on Sui
        const tx = new Transaction();

        // Set the sender
        tx.setSender(currentAccount.address);

        // Set the gas price (adjust as needed)
        tx.setGasPrice(1000); // Example: 1000 MIST (1 SUI = 1,000,000,000 MIST)

        // Set the gas budget (adjust as needed)
        tx.setGasBudget(10000000); // Example: 10,000,000 MIST

        // Convert Sui address to 20-byte vector
        const recipientBytes = suiAddressTo20Bytes(suiAddress);

        // Serialize the 20-byte vector using BCS
        const recipientArg = bcs.bytes(20).serialize(recipientBytes).toBytes();

        // Call your custom contract's mint function
        const [mintedCoin] = tx.moveCall({
          target: `${suiPackageId}::ibt::mint`, // Replace with your module and function
          typeArguments: [`${suiPackageId}::ibt::IBT`], // Replace with your coin type
          arguments: [
            tx.object(treasuryCapObjectId), // TreasuryCap object
            tx.pure.u64(suiAmount.toString()), // Amount to mint
            tx.pure(recipientArg), // Recipient address as 20-byte vector
          ],
        });

        // Transfer the minted coin to the recipient
        tx.transferObjects([mintedCoin], suiAddress);

        // Set gas payment
        tx.setGasPayment([{
          objectId: gasPaymentObject.coinObjectId,
          version: gasPaymentObject.version,
          digest: gasPaymentObject.digest,
        }]);

        // Sign and execute the Sui transaction
        await signAndExecuteTransaction({
          transaction: tx,
          options: {
            showEffects: true,
            showInput: true,
            showEvents: true,
          },
        });

        console.log('Transfer from Ethereum to Sui successful!');
        alert('Transfer from Ethereum to Sui successful!');
      } else if (sourceChain === 'sui') {
        // Sui to Ethereum transfer
        const tx = new Transaction();

        // Set the sender
        tx.setSender(currentAccount.address);

        // Set the gas price (adjust as needed)
        tx.setGasPrice(1000); // Example: 1000 MIST (1 SUI = 1,000,000,000 MIST)

        // Set the gas budget (adjust as needed)
        tx.setGasBudget(10000000); // Example: 10,000,000 MIST

        // Step 1: Fetch the user's Coin<IBT> object
        const coins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: `${suiPackageId}::ibt::IBT`,
        });

        if (coins.data.length === 0) {
          throw new Error('No IBT coins found in the wallet.');
        }

        // Use the first Coin<IBT> object
        const coinToBurn = coins.data[0].coinObjectId;

        // Step 2: Burn the Coin<IBT> using your custom contract's burn function
        tx.moveCall({
          target: `${suiPackageId}::ibt::burn`, // Replace with your module and function
          typeArguments: [`${suiPackageId}::ibt::IBT`], // Replace with your coin type
          arguments: [
            tx.object(treasuryCapObjectId), // TreasuryCap object
            tx.object(coinToBurn), // The Coin<IBT> to burn
            tx.pure.u64(suiAmount.toString()), // Amount to burn
          ],
        });

        // Set gas payment
        tx.setGasPayment([{
          objectId: gasPaymentObject.coinObjectId,
          version: gasPaymentObject.version,
          digest: gasPaymentObject.digest,
        }]);

        // Sign and execute the Sui transaction
        await signAndExecuteTransaction({
          transaction: tx,
          options: {
            showEffects: true,
            showInput: true,
            showEvents: true,
          },
        });

        console.log('Sui Burn Transaction successful!');

        // Step 3: Mint tokens on Ethereum
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethSigner = ethProvider.getSigner();
        const ethContract = new ethers.Contract(ethereumIBTAddress, ethContractABI, ethSigner);

        const gasPrice = await ethProvider.getGasPrice();
        const gasLimit = ethers.utils.hexlify(300000); // Adjust gas limit as needed

        const mintTx = await ethContract.mint(ethereumAddress, parsedAmount, {
          gasPrice,
          gasLimit,
        });
        await mintTx.wait();

        console.log('Ethereum Mint Transaction:', mintTx);
        alert('Transfer from Sui to Ethereum successful!');
      }
    } catch (error) {
      console.error('Full Error Object:', error);
      alert(`Transfer failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer} className="transfer-form">
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
        disabled={isLoading}
      />
      <select
        value={sourceChain}
        onChange={(e) => setSourceChain(e.target.value)}
        className="select"
        disabled={isLoading}
      >
        <option value="ethereum">Ethereum to Sui</option>
        <option value="sui">Sui to Ethereum</option>
      </select>
      <button type="submit" className="button transfer" disabled={isLoading}>
        {isLoading ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  );
};

export default TransferForm;