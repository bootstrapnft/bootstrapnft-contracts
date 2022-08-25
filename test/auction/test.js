const {expect} = require("chai");
const {BigNumber} = require("ethers");
const {ethers} = require("hardhat");

const zeroAddr = "0x0000000000000000000000000000000000000000";

const BActionABI = require("../../utils/contract/pool/BAction.json")
const {Interface} = require("ethers/lib/utils");

describe("Test Auction", function () {
    let primary, alice, bob;
    let bfactory;
    let testMumuToken;
    let weth, dai, usdc, bal;
    let cRPFactory;
    let bActions;
    let exchangeProxy;
    let dSProxyFactory;
    let proxyRegistry;
    let DsProxy;
    let ConfigurableRightsPool;
    let BPool;

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        primary = accounts[0];
        alice = accounts[1];
        bob = accounts[2];

        const RightsManager = await ethers.getContractFactory("contracts/auction/libraries/RightsManager.sol:RightsManager");
        const SmartPoolManager = await ethers.getContractFactory("SmartPoolManager");


        const BFactory = await ethers.getContractFactory("BFactory");
        const BalancerSafeMath = await ethers.getContractFactory("BalancerSafeMath");
        const BalancerSafeMathMock = await ethers.getContractFactory("BalancerSafeMathMock");

        bfactory = await BFactory.deploy();
        await bfactory.deployed();
        console.log("bfactory address:", bfactory.address)

        const balancerSafeMathMock = await BalancerSafeMathMock.deploy();
        await balancerSafeMathMock.deployed();
        console.log("balancerSafeMathMock address:", balancerSafeMathMock.address)

        const balancerSafeMath = await BalancerSafeMath.deploy();
        await balancerSafeMath.deployed();
        console.log("balancerSafeMath address:", balancerSafeMath.address)

        const rightsManager = await RightsManager.deploy();
        await rightsManager.deployed();
        console.log("rightsManager address:", rightsManager.address)

        const smartPoolManager = await SmartPoolManager.deploy();
        await smartPoolManager.deployed();
        console.log("smartPoolManager address:", smartPoolManager.address)


        const CRPFactory = await ethers.getContractFactory("CRPFactory", {
            libraries: {
                BalancerSafeMath: balancerSafeMath.address,
                RightsManager: rightsManager.address,
                SmartPoolManager: smartPoolManager.address,
            },
        });

        cRPFactory = await CRPFactory.deploy();
        await cRPFactory.deployed();
        console.log("cRPFactory address:", cRPFactory.address)


        const ESPFactory = await ethers.getContractFactory("ESPFactory", {
            libraries: {
                BalancerSafeMath: balancerSafeMath.address,
                RightsManager: rightsManager.address,
                SmartPoolManager: smartPoolManager.address,
            },
        });
        const eSPFactory = await ESPFactory.deploy();
        await eSPFactory.deployed();
        console.log("eSPFactory address:", eSPFactory.address)

        const TToken = await ethers.getContractFactory('TToken')
        const BActions = await ethers.getContractFactory('BActions')
        const Multicall = await ethers.getContractFactory('Multicall')
        const ExchangeProxy = await ethers.getContractFactory('ExchangeProxy')
        const MerkleRedeem = await ethers.getContractFactory('MerkleRedeem')
        const DSProxyFactory = await ethers.getContractFactory('DSProxyFactory')
        const ProxyRegistry = await ethers.getContractFactory('ProxyRegistry')
        DsProxy = await ethers.getContractFactory('DSProxy')
        BPool = await ethers.getContractFactory('BPool')
        ConfigurableRightsPool = await ethers.getContractFactory("ConfigurableRightsPool", {
            libraries: {
                BalancerSafeMath: balancerSafeMath.address,
                RightsManager: rightsManager.address,
                SmartPoolManager: smartPoolManager.address,
            },
        });

        const admin = accounts[0]
        console.log("admin address:", admin.address)


        testMumuToken = await TToken.deploy('Test Mumu', 'TESTMUMU', 18)
        await testMumuToken.deployed()
        console.log("testMumuToken address:", testMumuToken.address)


        //access information about your deployed contract instance
        weth = await TToken.deploy('Wrapped Ether', 'WETH', 18)
        await weth.deployed()
        console.log("weth address:", weth.address)

        dai = await TToken.deploy('Dai Stablecoin', 'DAI', 18)
        await dai.deployed()
        console.log("dai address:", dai.address)

        usdc = await TToken.deploy('UDSC Stablecoin', 'USDC', 6)
        await usdc.deployed()
        console.log("usdc address:", usdc.address)

        bal = await TToken.deploy('Test Bal', 'TBAL', 18)
        await bal.deployed()
        console.log("bal address:", bal.address)

        console.log(`weth:${weth.address}, dai:${dai.address}, usdc:${usdc.address}`)


        bActions = await BActions.deploy()
        await bActions.deployed()
        console.log("bActions address:", bActions.address)

        const multicall = await Multicall.deploy()
        await multicall.deployed()
        console.log("multicall address:", multicall.address)


        exchangeProxy = await ExchangeProxy.deploy(weth.address)
        await exchangeProxy.deployed()
        console.log("exchangeProxy address:", exchangeProxy.address)

        const merkleRedeem = await MerkleRedeem.deploy(bal.address)
        await merkleRedeem.deployed()
        console.log("merkleRedeem address:", merkleRedeem.address)
        const redeem = merkleRedeem.address


        dSProxyFactory = await DSProxyFactory.deploy()
        await dSProxyFactory.deployed()
        console.log("dSProxyFactory address:", dSProxyFactory.address)


        proxyRegistry = await ProxyRegistry.deploy(dSProxyFactory.address)
        await proxyRegistry.deployed()
        console.log("proxyRegistry address:", proxyRegistry.address)


        await testMumuToken.mint(admin.address, ethers.utils.parseUnits("145000", 18))
        await weth.mint(admin.address, ethers.utils.parseUnits("145000", 18))
        await dai.mint(admin.address, ethers.utils.parseUnits("145000", 18))
        await usdc.mint(admin.address, ethers.utils.parseUnits("145000", 18))
        await bal.mint(admin.address, ethers.utils.parseUnits("145000", 18))
        await bal.transfer(redeem, ethers.utils.parseUnits("20000", 18))


        const SorMultiCall = await ethers.getContractFactory("sorMultiCall");

        const sorMultiCall = await SorMultiCall.deploy();
        await sorMultiCall.deployed();
        console.log("sorMultiCall address:", sorMultiCall.address)

    })

    describe("Proxy", function () {
        it("should create proxy", async () => {
            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            expect(primaryProxyAddress).not.equal(zeroAddr)
            let aliceProxyAddress = await proxyRegistry.proxies(alice.address)
            console.log("aliceProxyAddress is :", aliceProxyAddress)
            expect(aliceProxyAddress).to.equal(zeroAddr)
        });
    })

    describe("Pools", function () {
        it("createPool", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: false,
                canChangeWeights: false,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)
            let crp = await ConfigurableRightsPool.attach(logCaller)
            expect(await crp.symbol()).to.equal(poolTokenSymbol)
            expect(await crp.name()).to.equal(poolTokenName)
            expect(await crp.totalSupply()).to.equal(initialSupply)

            let bpool = await BPool.attach(poolAddress)
            let numTokens = await bpool.getNumTokens()
            let currentTokens = await bpool.getCurrentTokens()

            expect(numTokens).to.equal(2)
            expect(currentTokens[0]).to.equal(testMumuToken.address)
            expect(currentTokens[1]).to.equal(usdc.address)
        })
        it("add liquidity multi assets", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: false,
                canChangeWeights: false,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)


            const joinSmartPoolData = ifac.encodeFunctionData("joinSmartPool", [
                logCaller,
                ethers.utils.parseEther("100").toString(),
                [
                    ethers.utils.parseEther("200").toString(),
                    ethers.utils.parseEther("200").toString(),
                ]
            ]);


            let joinSmartPoolTx = await dsProxy.connect(primary).execute(bActions.address, joinSmartPoolData)

            console.log("joinSmartPoolTx hash", joinSmartPoolTx.hash)


            let crp = await ConfigurableRightsPool.attach(logCaller)
            expect(await crp.symbol()).to.equal(poolTokenSymbol)
            expect(await crp.name()).to.equal(poolTokenName)
            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("200")
                .toString())

            let bpool = await BPool.attach(poolAddress)
            let numTokens = await bpool.getNumTokens()
            let currentTokens = await bpool.getCurrentTokens()

            expect(numTokens).to.equal(2)
            expect(currentTokens[0]).to.equal(testMumuToken.address)
            expect(currentTokens[1]).to.equal(usdc.address)
        })
        it("remove liquidity multi assets", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: false,
                canChangeWeights: false,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)


            const joinSmartPoolData = ifac.encodeFunctionData("joinSmartPool", [
                logCaller,
                ethers.utils.parseEther("100").toString(),
                [
                    ethers.utils.parseEther("200").toString(),
                    ethers.utils.parseEther("200").toString(),
                ]
            ]);


            let joinSmartPoolTx = await dsProxy.connect(primary).execute(bActions.address, joinSmartPoolData)

            console.log("joinSmartPoolTx hash", joinSmartPoolTx.hash)


            let crp = await ConfigurableRightsPool.attach(logCaller)


            let exitPoolTx = crp.connect(primary).exitPool(
                ethers.utils.parseEther("100").toString(),
                ["0", "0"]
            )

            console.log("exitPoolTx hash", exitPoolTx.hash)


            expect(await crp.symbol()).to.equal(poolTokenSymbol)
            expect(await crp.name()).to.equal(poolTokenName)
            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("100")
                .toString())

            let bpool = await BPool.attach(poolAddress)
            let numTokens = await bpool.getNumTokens()
            let currentTokens = await bpool.getCurrentTokens()

            expect(numTokens).to.equal(2)
            expect(currentTokens[0]).to.equal(testMumuToken.address)
            expect(currentTokens[1]).to.equal(usdc.address)
        })
        it("set swap enable", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: false,
                canChangeWeights: false,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)

            let setPublicSwapData = ifac.encodeFunctionData("setPublicSwap", [
                logCaller,
                false,
            ]);

            let setPublicSwapTx = await dsProxy.connect(primary).execute(bActions.address, setPublicSwapData)

            console.log("setPublicSwapTx hash", setPublicSwapTx.hash)


            let crp = await ConfigurableRightsPool.attach(logCaller)

            expect(await crp.isPublicSwap()).to.equal(false)

            setPublicSwapData = ifac.encodeFunctionData("setPublicSwap", [
                logCaller,
                true,
            ]);

            setPublicSwapTx = await dsProxy.connect(primary).execute(bActions.address, setPublicSwapData)
            console.log("setPublicSwapTx hash", setPublicSwapTx.hash)
            expect(await crp.isPublicSwap()).to.equal(true)
        })
        it("set swapFee", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: true,
                canChangeWeights: false,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)

            const newSwapFee = ethers.utils
                .parseEther("0.2")
                .div(100)
                .toString();

            const setSwapFeeData = ifac.encodeFunctionData("setSwapFee", [
                logCaller,
                newSwapFee,
            ]);

            let setSwapFeeTx = await dsProxy.connect(primary).execute(bActions.address, setSwapFeeData)
            console.log("setSwapFeeTx hash", setSwapFeeTx.hash)
            let bpool = await BPool.attach(poolAddress)
            expect(await bpool.getSwapFee()).to.equal(newSwapFee)
        })
        it("direct increaseWeight", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: true,
                canChangeWeights: true,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)


            let bpool = await BPool.attach(poolAddress)

            let testTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            let usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)
            console.log("testTokenWeight", testTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)

            let testTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            let usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testTokenDWeight", testTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)

            const increaseWeightData = ifac.encodeFunctionData("increaseWeight", [
                logCaller,
                testMumuToken.address,
                ethers.utils.parseEther("27"),
                ethers.utils.parseEther("100").toString(),
            ]);

            let increaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData)
            console.log("increaseWeightTx hash", increaseWeightTx.hash)

            testTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testTokenWeight", testTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testTokenDWeight", testTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)
        })
        it("direct decreaseWeight", async () => {

            const initialSupply = ethers.utils
                .parseEther("100")
                .toString();

            const swapFee = ethers.utils
                .parseEther("0.15")
                .div(100)
                .toString();

            const minimumWeightChangeBlockPeriod = 10;
            const addTokenTimeLockInBlocks = 10;

            const poolTokenSymbol = "TESTMUMU"
            const poolTokenName = "Test Mumu"

            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("22.22").toString(),
                ethers.utils.parseEther("22.22").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: true,
                canChangeWeights: true,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolParams = {
                poolTokenSymbol,
                poolTokenName,
                constituentTokens: tokens,
                tokenBalances: tokenBal,
                tokenWeights: weights,
                swapFee: swapFee,
            };

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            const ifac = new Interface(BActionABI);


            console.log("ifac", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);
            const data = ifac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);


            testMumuToken.connect(primary).approve()


            await proxyRegistry.connect(primary)["build()"]()
            let primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            let dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)


            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)


            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);

            let poolAddressHashStr = ""

            let poolAddress = ""
            let logCaller = ""

            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    poolAddressHashStr = logTemp.topics[2]
                    let parsedLog = iface.parseLog(logTemp)
                    logCaller = parsedLog.args["caller"]
                    poolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", logCaller)
            console.log("poolAddress", poolAddress)


            let bpool = await BPool.attach(poolAddress)

            let testTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            let usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)
            console.log("testTokenWeight", testTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)

            let testTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            let usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testTokenDWeight", testTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)



            let crp = await ConfigurableRightsPool.attach(logCaller)
            await crp.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            const decreaseWeightData = ifac.encodeFunctionData("decreaseWeight", [
                logCaller,
                testMumuToken.address,
                ethers.utils.parseEther("20"),
                ethers.utils.parseEther("100").toString(),
            ]);

            let decreaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, decreaseWeightData)
            console.log("decreaseWeightTx hash", decreaseWeightTx.hash)

            testTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testTokenWeight", testTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testTokenDWeight", testTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)
        })

    })


})