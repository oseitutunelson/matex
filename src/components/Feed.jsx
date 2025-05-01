import {useEffect, useState } from "react";
import axios from "axios";
import {Navigation} from "./Navigation";
import "../styles/feed.css";
import { ethers } from "ethers";
import truncateEthAddress from "truncate-eth-address";
import { Link } from "react-router-dom";
import { fetchGlobalNftHash } from "./userNftData";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { FaEthereum } from "react-icons/fa";
import contractAbi from "../contracts/NFT.sol/Nft.json";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import pLimit from 'p-limit';
import { FaEye } from "react-icons/fa";


const contractAddress = "0x2E24c9f292AD62F89C5e3601D1425B9Ac8D82105";

const NftFeed = () => {
  const [nftArray , setNftArray] = useState([]);
  const { address, isConnected } = useAppKitAccount()
  const [loading, setLoading] = useState(true);


  const fetchUserContentFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedNftHash = await fetchGlobalNftHash()
        const userIpfsHash = savedNftHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`, {
          crossdomain: true,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
        setNftArray(response.data); // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

const checkAccess = async (nft) => {
  const { tokenId } = nft;

  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return false;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(
    contractAddress,
    contractAbi.abi,
    signer
  );

  try {
    const hasAccess = await nftContract.checkAccess(
      tokenId,
      await signer.getAddress()
    );
    return hasAccess;
  } catch (error) {
    console.error("Error checking access:", error);
    return false;
  }
};
 // Check access for each NFT
 const checkAccessForAllNfts = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

  const updatedNftFeed = await Promise.all(
    nftArray.map(async (nft) => {
      const hasAccess = await nftContract.checkAccess(nft.tokenId, signer.getAddress());
      return { ...nft, hasAccess };
    })
  );

  setNftArray(updatedNftFeed); // Update feed with access status
};



//purchase nft access
const purchaseAccess = async (nft) => {
  const { tokenId, price } = nft;

  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(
    contractAddress,
    contractAbi.abi,
    signer
  );

  try {
    const tx = await nftContract.purchaseNFT(tokenId, {
      value: ethers.parseEther(price.toString()),
    });
    await tx.wait();
    alert("Purchase successful! You now have access to this content.");

   

    // Check access after purchase
    const hasAccess = await checkAccess(nft);
    if (hasAccess) {
      // Update state to reflect access
      setNftArray((prevFeed) =>
        prevFeed.map((item) =>
          item.tokenId === tokenId ? { ...item, hasAccess: true } : item
        )
      );
    }
  } catch (error) {
    console.error("Error purchasing NFT access:", error);
    alert("Transaction failed. Please try again.");
  }
};

useEffect(() => {
  const loadFeedAndCheckAccess = async () => {
    try {
      // Step 1: Fetch the NFT feed
      const globalFeedHash = await fetchGlobalNftHash();
      if (!globalFeedHash) return;
      console.log(globalFeedHash)

      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${globalFeedHash}`,
        {
          crossdomain: true,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
      );
      const fetchedFeed = response.data.filter(nft => nft.ImgHash); // Only keep NFTs with ImgHash


      // Step 2: Check access for each NFT
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const nftContract = new ethers.Contract(
          contractAddress,
          contractAbi.abi,
          signer
        );

        const limit = pLimit(3);

        const updatedFeed = await Promise.all(
          fetchedFeed.map((nft) =>
          limit(async () => {
              try {
                if (!nft.ImgHash) throw new Error("Missing ImgHash for NFT");
                const hasAccess = await nftContract.checkAccess(
                  nft.tokenId,
                  await signer.getAddress()
                );
                return { ...nft, hasAccess}; // Add views to NFT object
              } catch (viewError) {
                console.error(`Error fetching data for ${nft.ImgHash}:`, viewError);
                return { ...nft, views: 0 }; // Default to 0 views if error occurs
              }
            } )
          )
        );

        // Update the state with the updated feed
        setNftArray(updatedFeed);
      } else {
        alert("MetaMask is not installed!");
        setNftArray(fetchedFeed); // Set the feed without access checks
      }
    } catch (error) {
      console.error("Error loading feed or checking access:", error);
    }
  };

  loadFeedAndCheckAccess(); 
  setLoading(false)
  // Call the function inside useEffect
}, []); // Empty dependency array ensures it runs once on component mount





  return(
    <div>
       <div className="feed-container">
        <div className="nft-feed">
          <h2>Feed</h2>
          <div className="nft-cards">
            {nftArray.length === 0 || loading? (
          Array.from({ length: 6 }).map((_, i) => (
            <div className="nft-card" key={i}>
              <Skeleton height={200} />
              <Skeleton width={`60%`} />
              <Skeleton count={2} />
              <Skeleton width={`30%`} height={20} />
            </div>
          ))
            
          ) : (
            nftArray.map((nft, index) => (
              <div className="nft-card" key={index}>
              {nft.price === 0 || nft.hasAccess ? (
                <>
                  <Link
                    to={`/nft/${nft.ImgHash}`}
                    state={{ nft }}
                    className="link_nft"
                  >
                    <video
                      className="video"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0; // Optional: resets the video to the beginning
                      }}
                      muted // Required to autoplay without user interaction
                      loop 
                    >
                      <source
                        src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`}
                        type="video/mp4"
                      />
                    </video>
                  </Link>
            
                  <Link to={`/profile/${nft.creator}`} className="link_nft2">
                    <h4>{truncateEthAddress(`${nft.creator}`)}</h4>
                  </Link>
            
                  <h3>{nft.name}</h3>
                  <p>{nft.desc}</p>
                  <p>Price : Free Access</p>
                  <p><FaEye className="eye_views"/>&nbsp;{nft.views}</p>
                </>
              ) : (
                <div>
                  <div className="link_nft l_nft">
                    <video className="video"
                     onMouseEnter={(e) => e.currentTarget.play()}
                     onMouseLeave={(e) => {
                       e.currentTarget.pause();
                       e.currentTarget.currentTime = 0; // Optional: resets the video to the beginning
                     }}
                     muted // Required to autoplay without user interaction
                     loop 
                    >
                      <source
                        src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`}
                        type="video/mp4"
                      />
                    </video>
                  </div>
            
                  <Link to={`/profile/${nft.creator}`} className="link_nft2">
                    <h4>{truncateEthAddress(`${nft.creator}`)}</h4>
                  </Link>
            
                  <h3>{nft.name}</h3>
                  <p>{nft.desc}</p>
                  <p className='polygon_text'><img src='/polygon-token.svg' className='polygon' /><span className='polygon_price'> {nft.price}</span></p>

                  <button className='buy_button' onClick={() => purchaseAccess(nft)}>Buy Access</button>
                </div>
              )}
            </div>
            
            ))
          )}
            </div>
        </div>
      </div>
    </div>
  )
};

export default NftFeed;
