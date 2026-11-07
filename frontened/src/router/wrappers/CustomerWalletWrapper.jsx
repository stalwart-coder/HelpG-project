import { useNavigate } from 'react-router-dom';
import CustomerWallet from '../../screens/customer/Wallet';

export default function CustomerWalletWrapper() {
  const navigate = useNavigate();

  const goPost = () => navigate('/customer/post');

  return <CustomerWallet goPost={goPost} />;
}

