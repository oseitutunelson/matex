# 🔒 NFT Gated Content Platform

A decentralized content sharing platform where users can purchase access to token-gated videos minted as NFTs. Built with React, Solidity, Pinata IPFS, and Ethers.js, this platform allows creators to upload content, set pricing in MATIC, and manage access on-chain.

🚀 Features

    🔐 Token-Gated Content: Videos are locked until purchased.

    🧾 Smart Contract Access Control: Users must own the NFT or pay the price to access.

    🎥 IPFS Video Hosting: Content is uploaded and served via Pinata + IPFS.

    💳 MATIC Payment: Users purchase access using MATIC on the Polygon blockchain.

    🧠 Access Check: Users who’ve already purchased won’t pay again.

    📱 Responsive Frontend: Built with React for smooth UX.

🧱 Smart Contract (Solidity)

The contract allows:

    Minting NFTs with associated IPFS content

    Storing price and creator address

    Managing access to content per user

    Function checkAccess(tokenId, user) to verify access

    Function purchaseNFT(tokenId) to allow MATIC payments and grant access

🖼 Frontend (React.js)
Key Pages:

    Home: Displays a list of public NFTs with titles and thumbnails.

    NFT Detail: Token-specific page that shows:

        Blurred video if access is locked

        Unlock button with pricing (in MATIC)

        Full video if access is granted

        Creator and description

Tech Used:

    ethers.js for wallet interaction

    react-router for routing

    @reown/appkit/react for wallet/account management

    truncate-eth-address for address display

    Pinata for storing video files on IPFS

