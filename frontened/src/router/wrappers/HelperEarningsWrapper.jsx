import { useEffect, useState } from 'react';
import HelperEarnings from '../../screens/helper/Earnings';
import { useApp } from '../../context/AppContext';

export default function HelperEarningsWrapper() {
  const { earningsSummary, loadEarningsSummary, loadEarningsHistory, helperLoading, helperError } = useApp();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadEarningsSummary();
    loadEarningsHistory().then((data) => {
      if (data?.transactions) setTransactions(data.transactions);
    });
  }, [loadEarningsSummary, loadEarningsHistory]);

  const onRetry = () => {
    loadEarningsSummary();
    loadEarningsHistory().then((data) => {
      if (data?.transactions) setTransactions(data.transactions);
    });
  };

  return (
    <HelperEarnings
      earningsData={earningsSummary}
      transactions={transactions}
      loading={helperLoading}
      error={helperError}
      onRetry={onRetry}
    />
  );
}

