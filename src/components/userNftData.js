import contractAbi from "../contracts/UserNftData.sol/UserNFTData.json";
import { ethers } from "ethers";

const contractAddress = "0xEFaA4Ea5e0ba87315DFec70F6342C2471A57494f";

export const updateHashOnBlockchain = async (userNftHash) => {
   try{
    if(!window.ethereum){
        console.log("No Ethereum wallet found");
    }

   // Request account access
       await window.ethereum.request({ method: "eth_requestAccounts" });
      
   // Set up the provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);

      const tx = contract.updateUserNftHash(userNftHash);
      //await tx.wait();
      console.log("nft hash saved");
   }catch(error){
      console.log("Nft hash saved failed",error);
   }
}

export const fetchHashFromBlockchain = async (userAddress) =>{
    if (!userAddress || !ethers.isAddress(userAddress)) {
        console.error("Invalid user address provided:", userAddress);
        return null;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);
    
        const userHash = await contract.getUserNftHash(userAddress);
        console.log("Fetched user hash:", userHash);
        return userHash;
      } catch (error) {
        console.error("Error fetching user hash:", error);
      }
}

export const fetchGlobalNftHash = async () =>{
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return null;
}

       const provider = new ethers.BrowserProvider(window.ethereum);
       const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

    try {
       const globalFeedHash = await contract.getAllNfts();
       return globalFeedHash;
} catch (error) {
    console.error("Error fetching global feed hash from blockchain:", error);
    return null;
}
}