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
      if (!window.ethereum || !nfts.length) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftArtifact.abi, signer);

      const map = {};
      for (let nft of nfts) {
        const hasAccess = await contract.checkAccess(nft.tokenId, address);
        map[nft.tokenId] = hasAccess || nft.price === 0; 
      }
      setAccessMap(map);
    };

    fetchAccess();
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
        <p className="feed_loading">Loading NFTs...</p>
      ) : (
        <div className="nft-cards">
          {nfts.map((nft) => {
            const hasAccess = accessMap[nft.tokenId];

            return (
              <div key={nft.tokenId} className="nft-card">
                <Link to={`/matex/${nft.tokenId}`} className="nft-video-link">
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
                      filter: !hasAccess ? "blur(20px)" : "none",
                      pointerEvents: "none",
                      borderRadius: "12px",
                      width: "100%",
                    }}
                  />
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
