// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    const network = hre.network.name

    const SorMultiCall = await hre.ethers.getContractFactory("sorMultiCall");

    if (network === 'localhost' || network === 'development' || network === 'mumbai' || network === 'ropsten') {
        const sorMultiCall = await SorMultiCall.deploy();
        await sorMultiCall.deployed();
        console.log("sorMultiCall address:", sorMultiCall.address)
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
