import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractAbi from "../contracts/NFT.sol/Nft.json";

const CONTRACT_ADDRESS = "0x6F3dCC409Aaa0019D225065225e3c38f64E9cc3B";

export const usePublicNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, provider);
        const allNfts = await contract.getAllNfts();

        const parsed = allNfts.map((nft, index) => ({
          tokenId: nft.tokenId,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          creator: nft.creator,
          price: Number(ethers.formatEther(nft.price))
        }));

        setNfts(parsed);
      } catch (err) {
        console.error("Error loading NFTs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return { nfts, loading };
};
