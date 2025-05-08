import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicNFTs } from "./usePublicNfts";
import "../styles/nftdetails.css";
import truncateEthAddress from "truncate-eth-address";
import { ethers } from "ethers";
import nftArtifact from "../contracts/NFT.sol/Nft.json";
import { Navigation } from './Navigation';
import { useAppKitAccount } from "@reown/appkit/react";



const NFT_CONTRACT_ADDRESS = "0x6F3dCC409Aaa0019D225065225e3c38f64E9cc3B";

const NftDetail = () => {
  const { tokenId } = useParams();
  const { nfts, loading } = usePublicNFTs();

  const { address } = useAppKitAccount();
  const [contract, setContract] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const nft = nfts.find((n) => String(n.tokenId) === tokenId);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        //setUserAddress(address);

        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          nftArtifact.abi,
          signer
        );
        setContract(nftContract);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!contract || !nft || !address) return;

      try {
        const access = await contract.checkAccess(nft.tokenId, address);
        setHasAccess(access || nft.price === 0);
      } catch (err) {
        console.error("Error checking access:", err);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [contract, nft, address]);

  const handlePurchase = async () => {
    if (!contract || !nft) return;

    try {
      setPurchasing(true);
      const tx = await contract.purchaseNFT(nft.tokenId, {
        value: ethers.parseEther(nft.price.toString()),
      });
      await tx.wait();
      setTxStatus("Access granted!");
      setHasAccess(true);
    } catch (err) {
      console.error("Purchase failed:", err);
      setTxStatus("Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || checkingAccess) return <p>Loading...</p>;
  if (!nft) return <p>Video not found</p>;

  return (
    <>
    <Navigation/>
    <div className="nft-detail">
      <h2>{nft.name}</h2>

      {hasAccess ? (
        <video
          src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
          controls
          autoPlay
          loop
          playsInline
        />
      ) : (
        <div className="video-locked">
          <div className="video-blur">
            <video
              src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
              autoPlay
              loop
              muted
              playsInline
              style={{ filter: "blur(10px)", pointerEvents: "none" }}
            />
            <div className="overlay">
              <p>This content is locked.</p>
              <button onClick={handlePurchase} disabled={purchasing}>
                {purchasing
                  ? "Processing..."
                  : `Buy Access for ${nft.price} MATIC`}
              </button>
              <p>{txStatus}</p>
            </div>
          </div>
        </div>
      )}

      <p>{nft.description}</p>
      <p>
        <strong>Creator:</strong> {truncateEthAddress(nft.creator)}
      </p>
      <p>
        <strong>Price:</strong>{" "}
        {nft.price === 0 ? "Free" : `${nft.price} MATIC`}
      </p>
    </div>
    </>
  );
};

export default NftDetail;
