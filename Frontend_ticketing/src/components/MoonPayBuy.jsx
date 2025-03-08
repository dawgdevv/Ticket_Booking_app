import { useState, useEffect } from 'react';
import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import PropTypes from 'prop-types';
import axios from 'axios';

const MoonPayBuy = ({ 
  fiatCurrency = "inr", 
  fiatAmount = "5000", 
  cryptoCurrency = "eth",
  visible, 
  onClose, 
  onSuccess,
  onError 
}) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // You'll need URL signing for production with sensitive data
  useEffect(() => {
    if (visible) {
      const getSignedUrl = async () => {
        try {
          setLoading(true);
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/payment/sign-moonpay-url`,
            { 
              baseCurrencyCode: fiatCurrency,
              baseCurrencyAmount: fiatAmount,
              quoteCurrencyCode: cryptoCurrency
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          
          setSignedUrl(response.data.signedUrl);
        } catch (error) {
          console.error('Error signing MoonPay URL:', error);
          onError && onError(error);
        } finally {
          setLoading(false);
        }
      };
      
      // For development, we can skip URL signing
      if (import.meta.env.MODE === 'production') {
        getSignedUrl();
      }
    }
  }, [visible, fiatCurrency, fiatAmount, cryptoCurrency, onError]);

  const handleTransactionComplete = (data) => {
    console.log('MoonPay transaction completed:', data);
    onSuccess && onSuccess({
      transactionId: data.transactionId || data.id,
      fiatAmount: data.baseCurrencyAmount,
      fiatCurrency: data.baseCurrencyCode,
      cryptoAmount: data.quoteCurrencyAmount,
      cryptoCurrency: data.quoteCurrencyCode,
      provider: 'MoonPay',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <MoonPayBuyWidget
        variant="overlay"
        baseCurrencyCode={fiatCurrency}
        baseCurrencyAmount={fiatAmount}
        quoteCurrencyCode={cryptoCurrency}
        visible={visible && (!loading)}
        onClose={onClose}
        onTransactionCompleted={handleTransactionComplete}
        onTransactionFailed={(error) => {
          console.error('MoonPay transaction failed:', error);
          onError && onError(error);
        }}
        // Use signed URL if available (for production)
        signedUrl={signedUrl}
        // Display a test badge in development mode
        colorCode="#3b82f6"
        showTestModeBadge={import.meta.env.MODE !== 'production'}
      />
    </div>
  );
};

MoonPayBuy.propTypes = {
  fiatCurrency: PropTypes.string,
  fiatAmount: PropTypes.string,
  cryptoCurrency: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default MoonPayBuy;