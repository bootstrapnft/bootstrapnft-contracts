// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const TToken = await hre.ethers.getContractFactory('TToken')
    const BActions = await hre.ethers.getContractFactory('BActions')
    const Multicall = await hre.ethers.getContractFactory('Multicall')
    const ExchangeProxy = await hre.ethers.getContractFactory('ExchangeProxy')
    const MerkleRedeem = await hre.ethers.getContractFactory('MerkleRedeem')
    const DSProxyFactory = await hre.ethers.getContractFactory('DSProxyFactory')
    const ProxyRegistry = await hre.ethers.getContractFactory('ProxyRegistry')
    const accounts = await hre.ethers.getSigners();

    const network = hre.network.name

    if (network === 'localhost' || network === 'development' || network === 'rinkeby' || network === 'moonbase') {
        const admin = accounts[0]
        console.log("admin address:", admin.address)
        //access information about your deployed contract instance
        const weth = await TToken.deploy('Wrapped Ether', 'WETH', 18)
        await weth.deployed()
        console.log("weth address:", weth.address)

        const dai = await TToken.deploy('Dai Stablecoin', 'DAI', 18)
        await dai.deployed()
        console.log("dai address:", dai.address)

        const usdc = await TToken.deploy('UDSC Stablecoin', 'USDC', 6)
        await usdc.deployed()
        console.log("usdc address:", usdc.address)

        const bal = await TToken.deploy('Test Bal', 'TBAL', 18)
        await bal.deployed()
        console.log("bal address:", bal.address)

        console.log(`weth:${weth.address}, dai:${dai.address}, usdc:${usdc.address}`)


        const bActions = await BActions.deploy()
        await bActions.deployed()
        console.log("bActions address:", bActions.address)

        const multicall = await Multicall.deploy()
        await multicall.deployed()
        console.log("multicall address:", multicall.address)


        const exchangeProxy = await ExchangeProxy.deploy(weth.address)
        await exchangeProxy.deployed()
        console.log("exchangeProxy address:", exchangeProxy.address)

        const merkleRedeem = await MerkleRedeem.deploy(bal.address)
        await merkleRedeem.deployed()
        console.log("merkleRedeem address:", merkleRedeem.address)
        const redeem = merkleRedeem.address


        const dSProxyFactory = await DSProxyFactory.deploy()
        await dSProxyFactory.deployed()
        console.log("dSProxyFactory address:", dSProxyFactory.address)


        const proxyRegistry = await ProxyRegistry.deploy(dSProxyFactory.address)
        await proxyRegistry.deployed()
        console.log("proxyRegistry address:", proxyRegistry.address)



        await weth.mint(admin.address,ethers.utils.parseUnits("145000", 18))
        await dai.mint(admin.address,ethers.utils.parseUnits("145000", 18) )
        await usdc.mint(admin.address,ethers.utils.parseUnits("145000", 18))
        await bal.mint(admin.address,ethers.utils.parseUnits("145000", 18) )
        await bal.transfer(redeem,ethers.utils.parseUnits("20000", 18))

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
