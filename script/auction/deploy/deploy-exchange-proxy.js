// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();


    const TToken = await hre.ethers.getContractFactory('TToken')
    const ExchangeProxy = await hre.ethers.getContractFactory('ExchangeProxy')


    const weth = await TToken.attach("0xA95aA7229Aaf354CA18FB8f9A5aA3e78B88a2806")
    console.log("weth address:", weth.address)


    const exchangeProxy = await ExchangeProxy.deploy(weth.address)
    await exchangeProxy.deployed()
    console.log("exchangeProxy address:", exchangeProxy.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
