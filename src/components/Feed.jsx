import React from "react";
import { usePublicNFTs } from "./usePublicNfts";
import truncateEthAddress from "truncate-eth-address";
import "../styles/feed.css";

const NftFeed = () => {
  const { nfts, loading } = usePublicNFTs();

  return (
    <div className="nft-feed">
      <h2>Feed</h2>

      {loading ? (
        <p>Loading NFTs...</p>
      ) : (
        <div className="nft-cards">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="nft-card">
              <video
                src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
                muted
                loop
                playsInline
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => {
                  e.target.pause();
                  e.target.currentTime = 0;
                }}
              />
                            <p><strong>Creator:</strong> {truncateEthAddress(nft.creator)}</p>

              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p><strong>Price:</strong> {nft.price === 0 ? "Free" : `${nft.price} MATIC`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NftFeed;
