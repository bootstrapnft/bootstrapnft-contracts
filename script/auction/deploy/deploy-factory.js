// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    const network = hre.network.name

    const RightsManager = await hre.ethers.getContractFactory("contracts/auction/libraries/RightsManager.sol:RightsManager");
    const SmartPoolManager = await hre.ethers.getContractFactory("SmartPoolManager");


    const BFactory = await hre.ethers.getContractFactory("BFactory");
    const BootstrapNftSafeMath = await hre.ethers.getContractFactory("BootstrapNftSafeMath");
    const BootstrapNftSafeMathMock = await hre.ethers.getContractFactory("BootstrapNftSafeMathMock");

    if (network === 'localhost' || network === 'development' || network === 'rinkeby' || network === 'shibuya') {
        const bfactory = await BFactory.deploy();
        await bfactory.deployed();
        console.log("bfactory address:", bfactory.address)

        const bootstrapNftSafeMathMock = await BootstrapNftSafeMathMock.deploy();
        await bootstrapNftSafeMathMock.deployed();
        console.log("bootstrapNftSafeMathMock address:", bootstrapNftSafeMathMock.address)
    }

    const bootstrapNftSafeMath = await BootstrapNftSafeMath.deploy();
    await bootstrapNftSafeMath.deployed();
    console.log("bootstrapNftSafeMath address:", bootstrapNftSafeMath.address)

    const rightsManager = await RightsManager.deploy();
    await rightsManager.deployed();
    console.log("rightsManager address:", rightsManager.address)

    const smartPoolManager = await SmartPoolManager.deploy();
    await smartPoolManager.deployed();
    console.log("smartPoolManager address:", smartPoolManager.address)


    const CRPFactory = await hre.ethers.getContractFactory("CRPFactory" ,{
        libraries: {
            BootstrapNftSafeMath: bootstrapNftSafeMath.address,
            RightsManager:rightsManager.address,
            SmartPoolManager:smartPoolManager.address,
        },
    });

    const cRPFactory = await CRPFactory.deploy();
    await cRPFactory.deployed();
    console.log("cRPFactory address:", cRPFactory.address)


    if (network === 'development' || network === 'rinkeby' || network === 'shibuya') {
        const ESPFactory = await hre.ethers.getContractFactory("ESPFactory",{
            libraries: {
                BootstrapNftSafeMath: bootstrapNftSafeMath.address,
                RightsManager:rightsManager.address,
                SmartPoolManager:smartPoolManager.address,
            },
        });
        const eSPFactory = await ESPFactory.deploy();
        await eSPFactory.deployed();
        console.log("eSPFactory address:", eSPFactory.address)
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
