import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {Navigation} from './Navigation'
import  '../styles/profile.css'
import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { fetchUserProfileHash } from './creatorContract';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import {FaCamera} from 'react-icons/fa6'
import { UserNfts } from './ContentPage';


export const Creator = () => {
    const [editForm , setEditForm] = useState(false);
    const [userProfileDetails,setUserProfileDetails] = useState(null);
    const [username,setUsername] = useState('');
    const [description,setDescription] = useState('');
    const [profileImg, setProfileImg] = useState(null);
    const [coverImg, setCoverImg] = useState(null);
    const [profileArray, setProfileArray] = useState([])
    const { address, isConnected } = useAppKitAccount()
    const {walletAddress} = useParams();



    const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

   
  const fetchUserProfileFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedProfileHash = await fetchUserProfileHash(address);
        const userIpfsHash = savedProfileHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{crossdomain : true,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
        setProfileArray(response.data);

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

useEffect(() => {
  if (address) {
      fetchUserProfileFromIPFS();
  }
}, [address]);

useEffect(() => {
    if (walletAddress) {
        console.log(walletAddress);
    }
}, [walletAddress]);

  
    return(
      <>
    <Navigation/>
        <div className='profile'>
          
         <div className='profile_details'>
          {profileArray.length === 0 ? (
           <>
           <div className='cover_photo'>
            <h3>mateX</h3>  
          </div>
            <div className='profile_photo'>
            <FaCamera className='profile_before'/>
         </div>
         <div className='profile_info'>
           <h3>Username</h3>
           <p>Description</p>
         </div>
           </>
          ) : (
            (() => {
              const profile = profileArray[profileArray.length - 1];
          
              return (
                <>
                  <div className='cover_photo'>
                    <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${profile.cover_image}`} alt=''/>
                  </div>
                  <div className='profile_photo'>
                    <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${profile.profile_image}`} alt=''/>
                  </div>
                  <div className='profile_info'>
                    <h3>{profile.username}</h3>
                    <p>{profile.description}</p>
                  </div>
                </>
              );
            })()
          )}
         
         </div>
          <div className='profile_edit'>
           <Link to={`/editProfile/${address}`}> <button>Edit Profile</button></Link>
          </div>
         
        </div>
        <div className='account'>
          <div className='account_creator'>
          <Link to='/createcontent'>  <button className='account_button'>create content</button></Link>
          </div>
          <UserNfts/>
        </div>
        </>
        
    )
}