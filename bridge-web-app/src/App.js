import React, { useState } from 'react';
import ConnectWallets from './components/ConnectWallets';
import Balances from './components/Balances';
import TransferForm from './components/TransferForm';
import ethContractABI from './eth_contract_abi.json'; // Import Ethereum IBT ABI

function App() {
  const [ethereumAddress, setEthereumAddress] = useState(null);
  const [suiAddress, setSuiAddress] = useState(null);

  // Replace with your deployed Ethereum IBT contract address
  const ethereumIBTAddress = '0x8464135c8F25Da09e49BC8782676a84730C318bC'; // Ethereum IBT contract address
  const suiPackageId = '0xe90a33f7435bdc03522945cbd92b4c791cc6af290c4d3c2726a663f2f8b29056'; // Sui package ID
  
  const handleEthereumConnect = (address) => {
    console.log('Ethereum Address:', address);
    setEthereumAddress(address);
  };

  const handleSuiConnect = (address) => {
    console.log('Sui Address:', address);
    setSuiAddress(address);
  };

  return (
    <div className="app">
      <h1>IBT Token Bridge</h1>
      <ConnectWallets
        onEthereumConnect={handleEthereumConnect}
        onSuiConnect={handleSuiConnect}
      />
      <Balances
        ethereumAddress={ethereumAddress}
        suiAddress={suiAddress}
        suiPackageId={suiPackageId}
        ethContractABI={ethContractABI.abi} // Pass Ethereum IBT ABI
        ethereumIBTAddress={ethereumIBTAddress} // Pass Ethereum IBT contract address
      />
      <TransferForm
        ethereumAddress={ethereumAddress}
        suiAddress={suiAddress}
        suiPackageId={suiPackageId}
        ethContractABI={ethContractABI.abi} // Pass Ethereum IBT ABI
        ethereumIBTAddress={ethereumIBTAddress} // Pass Ethereum IBT contract address
        treasuryCapObjectId="0xb0e28acee5060e27256ed3ba47ae5a46606cedbbb413927e7e266e2ad3f1f298"
      />
    </div>
  );
}

export default App;