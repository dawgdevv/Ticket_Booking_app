import { useState } from "react";
import PropTypes from "prop-types";
import MoonPayBuy from "./MoonPayBuy";
import MoonPaySell from "./MoonPaySell";
import { motion } from "framer-motion";

const MoonPayPayment = ({ amount, onPaymentSuccess, onPaymentFailure }) => {
  const [mode, setMode] = useState("buy"); // 'buy' or 'sell'
  const [showWidget, setShowWidget] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("eth");

  // Format amount for MoonPay (convert cents to whole units)
  const fiatAmount = (amount / 100).toFixed(2);

  // Rough estimate of crypto amount based on current rates
  // In a real app, you would fetch real-time exchange rates
  const getCryptoAmount = () => {
    const rates = {
      eth: 3000, // 1 ETH ≈ $3000
      btc: 65000, // 1 BTC ≈ $65000
      usdc: 1, // 1 USDC ≈ $1
    };

    const amountInUSD = fiatAmount * 0.012; // Rough INR to USD conversion
    return (amountInUSD / rates[selectedCrypto]).toFixed(8);
  };

  const handleSuccess = (data) => {
    onPaymentSuccess({
      ...data,
      paymentMethod: "moonpay",
      mode,
    });
    setShowWidget(false);
  };

  const handleError = (error) => {
    onPaymentFailure(error);
    setShowWidget(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-black">MoonPay Payments</h2>

      <div className="mb-6">
        <div className="flex mb-4 border rounded-lg overflow-hidden">
          <button
            onClick={() => setMode("buy")}
            className={`flex-1 py-2 px-4 text-center ${
              mode === "buy"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Buy Crypto & Pay
          </button>
          <button
            onClick={() => setMode("sell")}
            className={`flex-1 py-2 px-4 text-center ${
              mode === "sell"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Sell Crypto for Cash
          </button>
        </div>

        {mode === "sell" && (
          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Select which cryptocurrency to sell:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {["eth", "btc", "usdc"].map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`p-3 border rounded-md ${
                    selectedCrypto === crypto
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={`/crypto-icons/${crypto}.png`}
                      alt={crypto.toUpperCase()}
                      className="h-8 w-8 mb-1"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/32?text=" +
                          crypto.toUpperCase();
                      }}
                    />
                    <span className="text-sm uppercase">{crypto}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 text-sm text-gray-500">
              <p>
                Estimated amount: {getCryptoAmount()}{" "}
                {selectedCrypto.toUpperCase()}
              </p>
              <p>(Based on approximate market rates)</p>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowWidget(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg mt-4"
        >
          {mode === "buy"
            ? "Continue to Buy Crypto"
            : `Sell ${selectedCrypto.toUpperCase()} for Cash`}
        </motion.button>
      </div>

      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
        <p className="font-medium mb-2">How it works:</p>
        {mode === "buy" ? (
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Purchase cryptocurrency using your credit card or bank account
            </li>
            <li>The purchased crypto will be used to pay for your ticket</li>
            <li>Transaction is secured and processed by MoonPay</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            <li>Sell your existing cryptocurrency for cash payment</li>
            <li>Funds will be deposited to your bank account</li>
            <li>Use these funds for ticket purchase</li>
          </ul>
        )}
      </div>

      {/* MoonPay Widgets */}
      {mode === "buy" && (
        <MoonPayBuy
          visible={showWidget}
          onClose={() => setShowWidget(false)}
          fiatCurrency="inr"
          fiatAmount={fiatAmount.toString()}
          cryptoCurrency={selectedCrypto}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {mode === "sell" && (
        <MoonPaySell
          visible={showWidget}
          onClose={() => setShowWidget(false)}
          cryptoCurrency={selectedCrypto}
          cryptoAmount={getCryptoAmount().toString()}
          fiatCurrency="inr"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
};

MoonPayPayment.propTypes = {
  amount: PropTypes.number.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onPaymentFailure: PropTypes.func.isRequired,
};

export default MoonPayPayment;
