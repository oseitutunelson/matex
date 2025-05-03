//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

/**
 * @title  Nft  Contract
 * @author Owusu Nelson Osei Tutu
 * @notice A nft contract with additional features 
 */

import {ERC721URIStorage,ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "./Counters.sol";

contract Nft is ERC721URIStorage,Ownable{
     using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
     uint256 public totalSupply;
     //nft data structure
     struct NftMetadata {
        uint256 tokenId;
        string name;
        string description;
        string image;
        uint256 price;
        //bool isOneTimePurchase;
        address creator;
    }


  
    uint256[] private _mintedTokenIds;
     // Track who has access
     // Store access control: tokenId => user => access status
    mapping(uint256 => mapping(address => bool)) public hasAccess; 
        mapping(uint256 => NftMetadata) private _tokenMetadata;
    mapping(uint256 => NftMetadata) public nfts;
    mapping(address => uint256) public addressToEarnings;

   constructor(string memory name, string memory symbol,address initialOwner) ERC721(name,symbol) Ownable(initialOwner){
   }

   /**
    *   Functions
    */

   //mint function
   function mint(
        address to,
        string memory name_,
        string memory description,
        string calldata image,
        uint256 price) external{
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId,image);

    _tokenMetadata[newTokenId] = NftMetadata({
        tokenId:newTokenId,
        name: name_,
        description: description,
        image: image,
        price: price,
        creator: msg.sender
    });
         totalSupply++;
        _mintedTokenIds.push(newTokenId);
   }

   function purchaseNFT(uint256 tokenId) public payable {
        NftMetadata storage nft = _tokenMetadata[tokenId];
        require(msg.value >= nft.price, "Insufficient funds");
        require(!hasAccess[tokenId][msg.sender], "Already purchased");
        hasAccess[tokenId][msg.sender] = true; // Grant access to the buyer
        // Transfer funds to the creator
        payable(nft.creator).transfer(msg.value);
        addressToEarnings[nft.creator] += msg.value;
    }

    function checkAccess(uint256 tokenId, address user) public view returns (bool) {
        return hasAccess[tokenId][user];
    }

     /** Getter Functions */
     
     

    function getCreatorEarnings(address creator) public view returns (uint256){
        return addressToEarnings[creator];
    }

    /**
 * @dev Get NFT details by tokenId
 */
function getNftMetadata(uint256 tokenId) external view returns (
        string memory name_,
        string memory description,
        string memory image,
        uint256 price,
        address creator
    ) {
        //require(nfts[tokenId], "Token does not exist");
        NftMetadata memory data = _tokenMetadata[tokenId];
        return (
            data.name,
            data.description,
            data.image,
            data.price,
            data.creator
        );
    }

function getAllNfts() external view returns (NftMetadata[] memory) {
        uint256 total = _mintedTokenIds.length;
        NftMetadata[] memory allNfts = new NftMetadata[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = _mintedTokenIds[i];
            allNfts[i] = _tokenMetadata[tokenId];
        }

        return allNfts;
    }
    
}