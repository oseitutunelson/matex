import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import nftArtifact from '../contracts/NFT.sol/Nft.json';
import { ethers } from 'ethers';
import '../styles/mint.css';
import { useAppKitAccount } from "@reown/appkit/react";
import { BiArrowBack } from "react-icons/bi";
import { Link } from 'react-router-dom';
import axios from 'axios';

export const MintNft = () => {
  const [fileImg, setFileImg] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  //const [tokenId, setTokenId] = useState(Date.now());
  const [price, setPrice] = useState(0);
  const [isOneTimePurchase, setIsOneTimePurchase] = useState(false);
  const [contentId, setContentId] = useState("");

  const { address } = useAppKitAccount();

  const getImageFromIPFS = async () => {
    if (!fileImg) return "";
    const formData = new FormData();
    formData.append("file", fileImg);

    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
        'pinata_secret_api_key': import.meta.env.VITE_PINATA_API_SECRET,
        "Content-Type": "multipart/form-data"
      },
    });

    return `ipfs/${resFile.data.IpfsHash}`;
  };

  const mintNft = async (e) => {
    e.preventDefault();
    const status = document.getElementById("status");

    try {
      const image = await getImageFromIPFS();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = '0x6F3dCC409Aaa0019D225065225e3c38f64E9cc3B';
      const nftContract = new ethers.Contract(contractAddress, nftArtifact.abi, signer);

      const tx = await nftContract.mint(
         address,
        name,
        desc,
        image,
        ethers.parseEther(price.toString()),
       
      );

      status.textContent = "Transaction submitted. Waiting for confirmation...";
      await tx.wait();
      status.textContent = "Transaction confirmed!";
      //setContentId(tokenId);
      console.log(`NFT minted!`);
    } catch (err) {
      console.error("Minting error:", err);
      status.textContent = "Transaction failed.";
    }
  };

  return (
    <div className='mint'>
      <Navigation />
      <Link to={`/creator/${address}`}><BiArrowBack className='mint_arrow' /></Link>

      <form onSubmit={mintNft}>
        <label htmlFor='file-upload' className='file-upload'>Upload Content</label>
        <input type="file" id='file-upload' onChange={(e) => setFileImg(e.target.files[0])} required />
        <input type="text" onChange={(e) => setName(e.target.value)} placeholder="name" required value={name} />
        <input type="text" onChange={(e) => setDesc(e.target.value)} placeholder="description" required value={desc} />
        <label htmlFor='price' className='price'>Price (ETH)</label>
        <input type="number" step="any" onChange={(e) => setPrice(e.target.value)} placeholder="0 = Free" required value={price} />
         
        <button className="form_button" type="submit">Mint NFT</button>
        <p id="status"></p>
      </form>
    </div>
  );
};
