import { useState, useEffect } from "react";
import { KeychainSDK } from "keychain-sdk";

const HivePayment = ({
  amount,
  username,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("initial"); // initial, confirming, complete
  const [rcPercentage, setRcPercentage] = useState(null);
  const [isLoadingRC, setIsLoadingRC] = useState(false);
  const [selectedRpc, setSelectedRpc] = useState("https://api.hive.blog");
  const [showRpcOptions, setShowRpcOptions] = useState(false);

  // Available RPC nodes
  const rpcNodes = [
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://api.deathwing.me",
    "https://rpc.ecency.com",
    "https://hived.privex.io",
  ];

  // Convert amount from INR to "virtual" HIVE (just for display)
  const getHiveAmount = () => {
    // Simple conversion ratio (1 HIVE = 300 INR)
    const estimatedHiveAmount = (amount / 300).toFixed(3);
    return estimatedHiveAmount;
  };

  // Fetch user's RC when component mounts
  useEffect(() => {
    if (username) {
      fetchUserRC(username);
    }
  }, [username]);

  // Function to fetch user's RC
  const fetchUserRC = async (username) => {
    if (!username) return;

    setIsLoadingRC(true);
    try {
      // Query RC percentage using the selected RPC
      const rcResponse = await fetch(`${selectedRpc}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "rc_api.find_rc_accounts",
          params: { accounts: [username] },
          id: 1,
        }),
      });

      const rcData = await rcResponse.json();

      if (
        rcData.result &&
        rcData.result.rc_accounts &&
        rcData.result.rc_accounts.length > 0
      ) {
        const account = rcData.result.rc_accounts[0];
        const max_rc = parseFloat(account.max_rc);
        const rc_manabar = account.rc_manabar;
        const current_mana = parseFloat(rc_manabar.current_mana);
        const percentage = Math.round((current_mana / max_rc) * 100);
        setRcPercentage(percentage);
      } else {
        console.error("Failed to fetch RC:", rcData);
        setRcPercentage(null);
      }
    } catch (error) {
      console.error("Error fetching RC:", error);
      setRcPercentage(null);
    } finally {
      setIsLoadingRC(false);
    }
  };

  // Function to handle RPC change
  const handleRpcChange = (newRpc) => {
    setSelectedRpc(newRpc);
    setShowRpcOptions(false);
    if (username) {
      fetchUserRC(username);
    }
  };

  // Function to use the native Hive Keychain browser extension directly
  const handleHivePayment = async () => {
    if (!username) {
      setError("Please sign in with Hive to make a payment");
      return;
    }

    // Check if RC is too low (below 20%)
    if (rcPercentage !== null && rcPercentage < 20) {
      setError(
        `Your Resource Credits (${rcPercentage}%) are too low for this transaction. Please wait for them to recharge.`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStep("confirming");

    try {
      // Instead of actual token transfer, broadcast a custom_json operation
      // This uses RCs but doesn't require actual HIVE tokens
      const hiveAmount = getHiveAmount();
      const paymentReference = `ticket-${Date.now()}`;

      const paymentMemo = JSON.stringify({
        app: "TicketBookingApp",
        action: "simulated_payment",
        amount: hiveAmount,
        currency: "HIVE",
        purchaseId: paymentReference,
        timestamp: new Date().toISOString(),
        note: "This is a simulated payment using resource credits only",
      });

      // Use the browser's Hive Keychain extension directly instead of the SDK
      // This bypasses potential SDK issues or version incompatibilities
      if (typeof window.hive_keychain === "undefined") {
        throw new Error("Hive Keychain extension not found");
      }

      // Use direct Hive Keychain requestCustomJson method with RPC option
      window.hive_keychain.requestCustomJson(
        username,
        "ticket_booking_app_payment", // ID
        "Posting", // Auth type
        paymentMemo, // JSON payload
        "Ticket Payment Simulation", // Display name
        async function (response) {
          if (response.success) {
            // Payment simulation successful
            setStep("complete");
            setIsProcessing(false);

            // Format the payment details to be compatible with your backend
            const paymentDetails = {
              transactionId:
                response.result?.id ||
                response.result?.tx_id ||
                paymentReference,
              amount: hiveAmount,
              currency: "HIVE (Simulated)",
              timestamp: new Date().toISOString(),
              paymentMethod: "hive",
              status: "completed",
              simulatedPayment: true,
            };

            // Pass the payment details to the parent component
            onPaymentSuccess(paymentDetails);
          } else {
            console.error("Hive payment result error:", response);
            setError(
              "Payment simulation failed: " +
                (response.message || "Operation rejected")
            );
            setStep("initial");
            setIsProcessing(false);
            onPaymentFailure(response.message || "Operation rejected");
          }
        },
        selectedRpc // Pass the selected RPC URL here
      );
    } catch (error) {
      console.error("Hive payment error:", error);
      setError(
        "Payment simulation failed: " + (error.message || "Connection error")
      );
      setStep("initial");
      setIsProcessing(false);
      onPaymentFailure(error.message || "Connection error");
    }
  };

  // Show appropriate UI based on the payment step
  const renderContent = () => {
    switch (step) {
      case "confirming":
        return (
          <div className="text-center">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="rounded-full bg-amber-400 h-16 w-16 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">
                Please confirm the transaction in your Hive Keychain extension
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-green-500 h-16 w-16 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-green-700">
                Payment successful!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Processing your ticket...
              </p>
            </div>
          </div>
        );

      default: // initial state
        return (
          <>
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-center">
                <div className="text-lg font-medium">
                  Simulated payment amount:
                </div>
                <div className="text-3xl font-bold text-amber-800">
                  {getHiveAmount()} HIVE
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  (Equivalent to ₹{amount.toFixed(2)})
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-amber-600 font-medium">
                    Testing Mode:
                  </span>{" "}
                  No actual HIVE will be transferred
                </div>

                {/* RC display */}
                {username && (
                  <div className="mt-4 pt-2 border-t border-amber-200">
                    {isLoadingRC ? (
                      <p className="text-sm">
                        Loading your Resource Credits...
                      </p>
                    ) : rcPercentage !== null ? (
                      <div>
                        <p className="text-sm font-medium">
                          Your Resource Credits:
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className={`h-2.5 rounded-full ${
                              rcPercentage < 20
                                ? "bg-red-600"
                                : rcPercentage < 50
                                ? "bg-yellow-500"
                                : "bg-green-600"
                            }`}
                            style={{ width: `${rcPercentage}%` }}
                          ></div>
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            rcPercentage < 20
                              ? "text-red-600"
                              : rcPercentage < 50
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {rcPercentage}% available
                        </p>
                        {rcPercentage < 20 && (
                          <p className="text-xs text-red-600 mt-1">
                            Your RC is too low for this transaction
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-700">
                        Could not fetch your Resource Credits
                      </p>
                    )}
                  </div>
                )}

                {/* RPC Node selection */}
                <div className="mt-4 pt-2 border-t border-amber-200">
                  <p className="text-sm font-medium mb-1">Hive RPC Node:</p>
                  <div className="relative">
                    <button
                      onClick={() => setShowRpcOptions(!showRpcOptions)}
                      className="w-full text-left text-xs bg-white border border-gray-300 rounded-md px-2 py-1 flex justify-between items-center"
                    >
                      <span className="truncate">{selectedRpc}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            showRpcOptions ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                          }
                        />
                      </svg>
                    </button>
                    {showRpcOptions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {rpcNodes.map((rpc) => (
                          <button
                            key={rpc}
                            onClick={() => handleRpcChange(rpc)}
                            className={`w-full text-left text-xs px-2 py-2 hover:bg-gray-100 ${
                              selectedRpc === rpc
                                ? "bg-amber-50 font-medium"
                                : ""
                            }`}
                          >
                            {rpc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    If you're experiencing connection issues, try a different
                    RPC node
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleHivePayment}
              disabled={
                isProcessing || (rcPercentage !== null && rcPercentage < 20)
              }
              className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                ${
                  isProcessing || (rcPercentage !== null && rcPercentage < 20)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                }`}
            >
              {isProcessing
                ? "Processing Payment..."
                : rcPercentage !== null && rcPercentage < 20
                ? "Insufficient Resource Credits"
                : "Confirm Payment (Test Mode)"}
            </button>

            <div className="mt-4 text-sm text-gray-600 text-center">
              This will use your Resource Credits to record a transaction on the
              Hive blockchain
            </div>

            <div className="mt-2 text-xs text-center text-amber-700 font-medium">
              No actual HIVE tokens will be transferred in test mode
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Pay with HIVE</h2>
      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md mb-4 text-blue-700 text-sm">
        <div className="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Testing mode is active. This will simulate a payment using your
            Resource Credits without sending any actual HIVE tokens.
          </span>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default HivePayment;
