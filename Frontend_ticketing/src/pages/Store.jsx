import { useState } from "react";
import Modal from "../pages/modal.jsx";

const Store = () => {
  const [merchandise] = useState([
    {
      id: 1,
      name: "CyberPunk #5555",
      description:
        "A futuristic NFT with neon vibes from the CyberPunk collection.",
      price: 4.5,
      image:
        "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F02%2Fmaison-ookci-warped-reality-nfts-feature-interview-10.jpg?q=75&w=800&cbr=1&fit=max",
    },
    {
      id: 2,
      name: "Digital Dreamer #8839",
      description:
        "A dreamlike, surreal NFT masterpiece from the Dreamers series.",
      price: 7.2,
      image:
        "https://lh3.googleusercontent.com/APOU7EM-MqYb7N8ZG7NOUKYzY24YdSebMmCS8kiTDW4k4tpGxH0VCWWzr8wYoSFC2TxoBSkP6hCU6MQbryCfk8JFf6fLjWEVgbKZKtw",
    },
    {
      id: 3,
      name: "Crypto Samurai #1010",
      description:
        "A legendary warrior NFT from the Crypto Samurai collection, forged in the blockchain.",
      price: 9.3,
      image:
        "https://i.seadn.io/gae/9iSDL5MJ6Ed_nnsTIj4XLE3r4HraM7mDeDbKfuZreVFu5ge-ntKedsLbt7d05vz6HzV5od9hQg6h90Gt8h7vtcK301MhyvdvqQUbcg?w=500&auto=format",
    },

    // Artist/Exclusive NFT Drops
    {
      id: 4,
      name: "Galactic Empress #2021",
      description:
        "An otherworldly NFT that represents the power of a galactic empire.",
      price: 15.0,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv8gpZeaSIH4pPjAR6T_ITnzGVa_03h5Xj2A&s",
    },
    {
      id: 5,
      name: "Neon Tiger #7070",
      description:
        "A fiery tiger from the Neon Warriors series—an NFT to rule the digital jungle.",
      price: 11.8,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY8FjFtBr7lB2OxnzNllKfp97f6RrcJpHuAw&s",
    },
    {
      id: 6,
      name: "Holo King #9000",
      description:
        "A regal, holographic king NFT, symbolizing wealth and power in the metaverse.",
      price: 20.5,
      image:
        "https://images-platform.99static.com/ckO1iSoh2v7pV22d59BZiMSs-U8=/0x0:1000x1000/500x500/top/smart/99designs-contests-attachments/130/130379/attachment_130379047",
    },
    {
      id: 7,
      name: "Phantom Racer #3333",
      description:
        "A sleek, high-speed racer NFT from the Phantom Racer collection—built for the digital streets.",
      price: 13.2,
      image:
        "https://publish.one37pm.net/wp-content/uploads/2021/07/cool-cats-mobile.jpg",
    },
    {
      id: 8,
      name: "Vortex Voyager #8888",
      description:
        "A cosmic voyager NFT, exploring the infinite worlds within the blockchain.",
      price: 17.9,
      image: "https://i.redd.it/fhh17dzekx481.jpg",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState("");

  const handleBuyNow = (item) => {
    setSelectedItem(item);
    setIsPaymentModalOpen(true);
  };

  const handleSolanaPayment = async () => {
    if (!userPublicKey) {
      alert("Please enter your Solana public key.");
      return;
    }

    try {
      alert(`Payment successful for ${selectedItem.name} using Solana!`);
      setIsPaymentModalOpen(false);
    } catch (error) {
      error.message && alert(error.message);
      alert("Payment failed. Please try again.");
    }
  };

  const renderPaymentModal = () => {
    return (
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Pay with Solana</h2>
          <p className="mb-4">
            You&apos;re purchasing: <strong>{selectedItem?.name}</strong>
          </p>
          <p className="mb-4">Price: {selectedItem?.price.toFixed(2)} SOL</p>

          <input
            type="text"
            value={userPublicKey}
            onChange={(e) => setUserPublicKey(e.target.value)}
            placeholder="Enter your Solana public key"
            className="w-full px-4 py-2 mb-4 rounded-md border border-gray-300"
          />
          <button
            onClick={handleSolanaPayment}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Confirm Solana Payment
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="store-container">
      <h1 className="text-3xl font-bold mb-6">Official NFT Store</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {merchandise.map((item) => (
          <div
            key={item.id}
            className="flex flex-col border rounded-lg shadow-lg p-4 hover:shadow-xl transition"
          >
            <div className="flex-grow">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
              <p className="text-gray-600 mb-2 flex-grow">{item.description}</p>
              <p className="text-lg font-bold mb-4">
                {item.price.toFixed(2)} SOL
              </p>
            </div>
            <button
              onClick={() => handleBuyNow(item)}
              className="mt-auto w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {isPaymentModalOpen && renderPaymentModal()}
    </div>
  );
};

export default Store;
