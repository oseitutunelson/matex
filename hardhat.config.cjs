require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const {POLYGON_PRIVATE_KEY,POLYGON_API_KEY} = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    polygon :{
        url : `https://polygon-amoy.g.alchemy.com/v2/${POLYGON_API_KEY}`,
        accounts : [`0x${POLYGON_PRIVATE_KEY}`]
       }
  }
};
