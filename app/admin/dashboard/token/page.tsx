"use client";
import React, { use, useState } from 'react';
import { ethers } from 'ethers';

const AdminPanel = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const sendTokens = async (e:any) => {
    e.preventDefault();
    
    if (!window.ethereum) {
      setStatus("Please install MetaMask!");
      return;
    }

    try {
      setStatus("Connecting to wallet...");
      // 1. Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Transaction pending...");
      // 2. Send the transaction (Sending Native ETH in this example)
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount), // Converts '1.0' to Wei
      });

      // 3. Wait for confirmation
      await tx.wait();
      setStatus(`Success! Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Admin Token Sender</h2>
      <form onSubmit={sendTokens} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Recipient Address:</label>
          <input 
            type="text" 
            placeholder="0x..." 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        
        <div>
          <label>Amount (ETH):</label>
          <input 
            type="number" 
            step="0.0001"
            placeholder="0.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>

        <button 
          type="submit" 
          style={{ padding: '10px', background: '#f6851b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Send Tokens
        </button>
      </form>
      
      {status && <p style={{ marginTop: '20px', fontSize: '14px', wordBreak: 'break-all' }}>{status}</p>}
    </div>
  );
};

export default AdminPanel;