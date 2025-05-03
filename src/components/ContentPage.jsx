import {useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import '../styles/mint.css';
// import { fetchHashFromBlockchain } from './userNftData';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import contractAbi from '../contracts/NFT.sol/Nft.json';



export const UserNfts = () => {
    const { address, isConnected } = useAppKitAccount()
    const [nftArray, setNftArray] = useState([]);
    // const savedNftHash = localStorage.getItem('userNftHash');
    const [creatorEarnings,setCreatorEarnings] = useState(0)


    // const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

    

    // Function to fetch the user's NFT metadata array from IPFS
   

  

    // Call the function to load the user's NFTs when the component is mounted
    useEffect(() => {
        const fetchUserNftsFromIPFS = async () => {
            if (!address) {
                console.log("Wallet address not available yet.");
                return;
            }
    
            const savedNftHash = await fetchHashFromBlockchain(address);
            if (!savedNftHash) return;
    
            try {
                const response = await axios.get(
                    `https://gateway.pinata.cloud/ipfs/${savedNftHash}`,
                    {
                        crossdomain: true,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                );
                setNftArray(response.data);
            } catch (error) {
                console.log("Error fetching user's NFTs from IPFS:", error);
            }
        };
    
        fetchUserNftsFromIPFS();
    }, [address]);
    

    return (
        <div className='content'>
            <h3>Posts</h3>
         
            <div className="nft-container">
                {nftArray.length === 0 ? (
                    <p>No Content uploaded.</p>
                ) : (
                    nftArray.map((nft, index) => (
                        <div key={index} className="nft-item">
                 <video width='500px' height='400px' >
                    <source src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} type="video/mp4" />
                </video>
                            <h3>{nft.name}</h3>
                            <p>{nft.desc}</p>
                            <p className='polygon_text'><img src='/polygon-token.svg' className='polygon' /><span className='polygon_price'> {nft.price}</span></p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
