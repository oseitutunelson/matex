import React, { useState, useEffect } from "react";
import { usePublicNFTs } from "./usePublicNfts";
import truncateEthAddress from "truncate-eth-address";
import "../styles/feed.css";
import { Link } from "react-router-dom";
import nftArtifact from "../contracts/NFT.sol/Nft.json";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x6F3dCC409Aaa0019D225065225e3c38f64E9cc3B";

const NftFeed = () => {
  const { nfts, loading } = usePublicNFTs();
  const [accessMap, setAccessMap] = useState({});
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    const fetchAccess = async () => {
      const map = {};
  
      // Convert string prices to numbers and set default access
      for (let nft of nfts) {
        const price = Number(nft.price);
        if (price === 0) {
          map[nft.tokenId] = true; // Free content = always accessible
        } else {
          map[nft.tokenId] = false; // Paid content = locked by default
        }
      }
  
      if (!window.ethereum) {
        console.log("No wallet: showing only free content");
        setAccessMap(map);
        return;
      }
  
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, nftArtifact.abi, signer);
  
        for (let nft of nfts) {
          const price = Number(nft.price);
          if (price > 0) {
            const hasAccess = await contract.checkAccess(nft.tokenId, address);
            map[nft.tokenId] = hasAccess;
          }
        }
  
        setAccessMap(map);
      } catch (err) {
        console.error("Error checking access:", err);
        setAccessMap(map);
      }
    };
  
    if (nfts && nfts.length > 0) {
      fetchAccess();
    }
  }, [nfts]);
  
  
  const handleBuyAccess = async (nft) => {
    try {
      if (!window.ethereum) return alert("Connect wallet first");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftArtifact.abi, signer);

      setPurchasing(nft.tokenId);
      const tx = await contract.purchaseNFT(nft.tokenId, {
        value: ethers.parseEther(nft.price.toString()),
      });
      await tx.wait();
      alert("Purchase successful!");
      setAccessMap((prev) => ({ ...prev, [nft.tokenId]: true }));
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="nft-feed">
      <h2>Feed</h2>

      {loading ? (
        <p className="feed_loading">Loading Content...</p>
      ) : (
        <div className="nft-cards">
          {nfts.map((nft) => {
            const hasAccess = accessMap[nft.tokenId];

            return (
              <div key={nft.tokenId} className="nft-card">
                <Link to={`/matex/${nft.tokenId}`} className="nft-video-link">
                  <div>
                  <video
                    src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) e.target.play();
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }
                    }}
                    style={{
                      filter: accessMap[nft.tokenId] ? "none" : "blur(20px)",
                      pointerEvents: "none",
                      borderRadius: "12px",
                      width: "100%",
                    }}
                    
                    
                  />
                  </div>
                </Link>

                <p><strong>Creator:</strong> {truncateEthAddress(nft.creator)}</p>
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
                <p><strong>Price:</strong> {nft.price === 0 ? "Free" : `${nft.price} MATIC`}</p>

                {!hasAccess && nft.price > 0 && (
                  <button
                    onClick={() => handleBuyAccess(nft)}
                    disabled={purchasing === nft.tokenId}
                    className="buy_button"
                  >
                    {purchasing === nft.tokenId ? "Purchasing..." : "Buy to Unlock"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NftFeed;
