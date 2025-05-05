import React from "react";
import { useParams } from "react-router-dom"; // or useRouter for Next.js
import { usePublicNFTs } from "./usePublicNfts";
import "../styles/nftdetails.css";
import truncateEthAddress from "truncate-eth-address";

const NftDetail = () => {
  const { tokenId } = useParams();
  const { nfts, loading } = usePublicNFTs();

  const nft = nfts.find((nft) => String(nft.tokenId) === tokenId);
  if (loading) return <p>Loading...</p>;
  if (!nft) return <p>Video not found</p>;

  return (
    <div className="nft-detail">
      <h2>{nft.name}</h2>
      <video
        src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
        controls
        autoPlay
        loop
        playsInline
        muted
      />
      <p>{nft.description}</p>
      <p><strong>Creator:</strong> {truncateEthAddress(nft.creator)}</p>
            <p><strong>Price:</strong> {nft.price === 0 ? "Free" : `${nft.price} MATIC`}</p>
    </div>
  );
};

export default NftDetail;
