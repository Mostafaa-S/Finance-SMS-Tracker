import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Adjust this URL if your backend is on a different host/port
        const response = await axios.get('http://localhost:5000/api/summary');
        setSummary({
          totalSpent: response.data.totalSpent,
          totalGained: response.data.totalGained,
        });
        setTransactions(response.data.transactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to fetch financial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div>Loading financial data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Financial Dashboard</h1>

      {summary && (
        <div>
          <h2>Summary</h2>
          <p>Total Spent: {summary.totalSpent.toFixed(2)} EGP</p>
          <p>Total Gained: {summary.totalGained.toFixed(2)} EGP</p>
        </div>
      )}

      <h2>Recent Transactions</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Time</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Vendor</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Balance</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.transaction_date}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.transaction_time}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.type}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.amount.toFixed(2)} {transaction.currency}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.vendor}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.available_balance.toFixed(2)}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{transaction.transaction_category || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;