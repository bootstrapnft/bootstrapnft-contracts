// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    let primary, alice, bob;



    const network = hre.network.name

    const RightsManager = await hre.ethers.getContractFactory("contracts/auction/libraries/RightsManager.sol:RightsManager");
    const SmartPoolManager = await hre.ethers.getContractFactory("SmartPoolManager");


    const BFactory = await hre.ethers.getContractFactory("BFactory");
    const BalancerSafeMath = await hre.ethers.getContractFactory("BalancerSafeMath");
    const BalancerSafeMathMock = await hre.ethers.getContractFactory("BalancerSafeMathMock");

    if (network === 'localhost' || network === 'development' || network === 'rinkeby' || network === 'shibuya') {
        const bfactory = await BFactory.deploy();
        await bfactory.deployed();
        console.log("bfactory address:", bfactory.address)

        const balancerSafeMathMock = await BalancerSafeMathMock.deploy();
        await balancerSafeMathMock.deployed();
        console.log("balancerSafeMathMock address:", balancerSafeMathMock.address)
    }

    const balancerSafeMath = await BalancerSafeMath.deploy();
    await balancerSafeMath.deployed();
    console.log("balancerSafeMath address:", balancerSafeMath.address)

    const rightsManager = await RightsManager.deploy();
    await rightsManager.deployed();
    console.log("rightsManager address:", rightsManager.address)

    const smartPoolManager = await SmartPoolManager.deploy();
    await smartPoolManager.deployed();
    console.log("smartPoolManager address:", smartPoolManager.address)


    const CRPFactory = await hre.ethers.getContractFactory("CRPFactory" ,{
        libraries: {
            BalancerSafeMath: balancerSafeMath.address,
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
                BalancerSafeMath: balancerSafeMath.address,
                RightsManager:rightsManager.address,
                SmartPoolManager:smartPoolManager.address,
            },
        });
        const eSPFactory = await ESPFactory.deploy();
        await eSPFactory.deployed();
        console.log("eSPFactory address:", eSPFactory.address)
    }

    const TToken = await hre.ethers.getContractFactory('TToken')
    const BActions = await hre.ethers.getContractFactory('BActions')
    const Multicall = await hre.ethers.getContractFactory('Multicall')
    const ExchangeProxy = await hre.ethers.getContractFactory('ExchangeProxy')
    const MerkleRedeem = await hre.ethers.getContractFactory('MerkleRedeem')
    const DSProxyFactory = await hre.ethers.getContractFactory('DSProxyFactory')
    const ProxyRegistry = await hre.ethers.getContractFactory('ProxyRegistry')

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
