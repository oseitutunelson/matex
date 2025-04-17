import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet ,polygonAmoy} from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import '../styles/Navigation.css'
import {MdOutlineAccountCircle} from 'react-icons/md'
import { Link } from 'react-router-dom';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";


// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '2adfca29ecc73c623bd3ed49c7b66ec7'

// 2. Create a metadata object - optional
const metadata = {
  name: 'matex',
  description: 'matex',
  url: 'https://example.com', // origin must match your domain & subdomain
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
  const { address, isConnected } = useAppKitAccount()

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <div className='navigation'>
            <div className='navigation_logo'>
                <h3>intimateX</h3>
            </div>
            <div className='navigation_buttons'>
            <w3m-button/>
            <button className='navigation_balance'>0 MTX</button>
            <Link to={`/creator/${address}`}> <button><MdOutlineAccountCircle className='navigation_account'/></button></Link>
            </div>
        </div>
        
     </WagmiProvider>
  )
}