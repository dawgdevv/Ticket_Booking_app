import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ExplanationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  const togglePopup = () => setIsOpen(!isOpen);

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const questions = [
    {
      question: "Can you tell me about this app ?",
      answer:
        "DTIX is a decentralised platform for purchasing, reselling, and auctioning tickets, with the extra benefit of NFT integration. It enables users to bid on exclusive tickets, resale already acquired tickets, and purchase unique event-related NFTs. Every transaction is transparent, legitimate, and secure thanks to the use of blockchain technology. The platform aims to create a smooth, fair, and regulated marketplace that allows event attendees more control over their tickets while complying to legal and ethical norms.",
    },
    {
      question:
        "How do you ensure the security and privacy of users on the platform?",
      answer:
        "Security and privacy are top priorities. We implement industry-standard encryption for all transactions and personal data. Blockchain technology ensures transparency, while decentralized features mean there’s no central authority holding sensitive information. Users have full control over their data, and we strictly adhere to best practices for protecting user information.",
    },
    {
      question: "How is your app legal?",
      answer:
        "We understand your concerns regarding the resell feature. Please understand that our platform allows for authorised resales and transparent ticket transfers with event organiser clearance. Unlike illegal marketplaces, all transactions on the blockchain are verifiable, subject to event terms, and protected from price gouging. We provide a clear legal framework to ensure that everything is genuine and above board.",
    },
    {
      question: "Can I use the app without a crypto wallet?",
      answer:
        "Yes, you can still use the app without a crypto wallet, but it’s not recommended as you might miss out on exclusive deals and discounts.",
    },
    {
      question: "What are the rules for participating in auctions?",
      answer:
        "The auction rules are simple for now. Users can join and create auction rooms for golden tickets. Auction rooms last for 30 seconds, and the highest bidder wins. In the future, we plan to enhance this feature by introducing a moderator or admin role to regulate the flow of the auctions.",
    },
    {
      question:
        "What is the future roadmap for this app, and how do you plan to scale it?",
      answer:
        "Our roadmap includes integrating additional payment options beyond crypto, enhancing auction features with advanced bidding mechanisms, and collaborating with more event organizers to offer exclusive content. We also plan to create partnerships with NFT artists and businesses to expand the app's offerings and grow the user base, ensuring that the platform remains dynamic and continuously evolving.",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={togglePopup}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white shadow-lg rounded-t-2xl p-6 pb-20 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {questions.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="flex justify-between items-center w-full text-left"
                    >
                      <span className="text-lg font-medium text-gray-700">
                        {item.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          expandedQuestions.includes(index) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedQuestions.includes(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 text-gray-600"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={togglePopup}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-full shadow-lg absolute bottom-4 left-1/2 transform -translate-x-1/2 focus:outline-none hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
        >
          <svg
            className={`h-6 w-6 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default ExplanationPopup;
