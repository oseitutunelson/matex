import { createAppKit } from '@reown/appkit/react'
import { useState, useEffect } from 'react'; 
import { ethers, Contract} from 'ethers'

import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet ,polygonAmoy} from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import '../styles/Navigation.css'
import {MdOutlineAccountCircle} from 'react-icons/md'
import { Link } from 'react-router-dom';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import rewardAbi from '../contracts/RewardToken.sol/RewardToken.json'


// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '28a69ef76c511498bac6f0d6b89093b5'

// 2. Create a metadata object - optional
const metadata = {
  name: 'matex',
  description: 'matex',
  url: 'https://matex-two.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [mainnet, arbitrum,polygonAmoy]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function Navigation({ children }) {
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = '0x7444861c74eBa693002d67F3e904e978F3e306c9'
  const relayerPrivateKey = '0x681f8d7f47808db4623ecd36e8a14f947c1aa278cd217e61b3faff50c50e2215'
  const [rewardBalance, setRewardBalance] = useState(0);
  const [rewardedToday , setRewardedToday ] = useState(false);




   //reward user for daily logins
   const handleReward = async (userAddress) =>{
    //if(!isConnected) throw Error('User disconnected');
    try{
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const relayer = new ethers.Wallet(relayerPrivateKey,ethersProvider);
      const rewardContract = new Contract(contractAddress,rewardAbi.abi,relayer);
      const gasPrice = ethers.parseUnits('65','gwei').toString();
      console.log(gasPrice)
      const tx = await rewardContract.rewardUser(userAddress,{
        gasPrice : gasPrice
      });
      await tx.wait();
      console.log('Reward granted');
    }catch(error){
      console.log('Reward not granted',error);
    }
}

const checkRewardEligibility = async () => {
  try {
      // if(!isConnected){
      //     console.log('Wallet not connected');
      // }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const relayer = new ethers.Wallet(relayerPrivateKey,provider);
      const contract = new ethers.Contract(contractAddress, rewardAbi.abi, relayer);

      // Check if the user is eligible for rewards
      const eligible = await contract.checkRewardEligibility(address);
      console.log("Eligibility check:", eligible);

      if (eligible) {
          // Instead of user rewarding themselves, the relayer will reward them
          handleReward(address);
      } else {
          setRewardedToday(true); // Indicate that the user has already been rewarded
      }
  } catch (error) {
      console.error("Error checking reward eligibility:", error);
  }
};
  //get reward balance
  const getRewardBalance = async () => {
    try {
        // if (!isConnected) {
        //     console.log("No wallet connected");
        //     return; // Stop execution if no wallet is connected
        // }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, rewardAbi.abi, signer);
        
        // Call balanceOf to get the user's reward balance
        const balance = await contract.balanceOf(address);
        const formattedBalance = ethers.formatEther(balance,18); // Assuming token has 18 decimals
        console.log("User's reward balance:", formattedBalance);
        setRewardBalance(formattedBalance);
         
    } catch (error) {
        console.error("Error fetching reward balance:", error);
    }
};

useEffect(() =>{
  if(isConnected){  
    //getCreator()
    checkRewardEligibility();
    getRewardBalance();
 
  }
   
 },[])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <div className='navigation'>
            <div className='navigation_logo'>
            <Link to='/' className='app_link'><h3>intimateX</h3></Link>            </div>
            <div className='navigation_buttons'>
            <div className='appkit_button'>
           <w3m-button/>
            </div>
            <button className='navigation_balance'>{rewardBalance} MTX</button>
            <Link to={`/creator/${address}`}> <button><MdOutlineAccountCircle className='navigation_account'/></button></Link>
            </div>
        </div>
        
     </WagmiProvider>
  )
}