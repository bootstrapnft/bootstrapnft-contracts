const {expect} = require("chai");
const {BigNumber} = require("ethers");
const {ethers} = require("hardhat");

const zeroAddr = "0x0000000000000000000000000000000000000000";

const BActionABI = require("../../utils/contract/pool/BAction.json")
const {Interface} = require("ethers/lib/utils");
const {advanceBlockTo} = require("../../utils/utils");

describe("Test Auction", function () {
    let primary, alice, bob;
    let bfactory;
    let testMumuToken;
    let testLalalaToken;
    let weth, dai, usdc, bal;
    let cRPFactory;
    let bActions;
    let exchangeProxy;
    let dSProxyFactory;
    let proxyRegistry;
    let DsProxy;
    let dsProxy
    let ConfigurableRightsPool;
    let BPool;


    before(async function () {
        const accounts = await ethers.getSigners();
        primary = accounts[0];
        alice = accounts[1];
        bob = accounts[2];

        const RightsManager = await ethers.getContractFactory("contracts/auction/libraries/RightsManager.sol:RightsManager");
        const SmartPoolManager = await ethers.getContractFactory("SmartPoolManager");


        const BFactory = await ethers.getContractFactory("BFactory");
        const BootstrapNftSafeMath = await ethers.getContractFactory("BootstrapNftSafeMath");
        const BootstrapNftSafeMathMock = await ethers.getContractFactory("BootstrapNftSafeMathMock");

        bfactory = await BFactory.deploy();
        await bfactory.deployed();
        console.log("bfactory address:", bfactory.address)

        const bootstrapNftSafeMathMock = await BootstrapNftSafeMathMock.deploy();
        await bootstrapNftSafeMathMock.deployed();
        console.log("bootstrapNftSafeMathMock address:", bootstrapNftSafeMathMock.address)

        const bootstrapNftSafeMath = await BootstrapNftSafeMath.deploy();
        await bootstrapNftSafeMath.deployed();
        console.log("bootstrapNftSafeMath address:", bootstrapNftSafeMath.address)

        const rightsManager = await RightsManager.deploy();
        await rightsManager.deployed();
        console.log("rightsManager address:", rightsManager.address)

        const smartPoolManager = await SmartPoolManager.deploy();
        await smartPoolManager.deployed();
        console.log("smartPoolManager address:", smartPoolManager.address)


        const CRPFactory = await ethers.getContractFactory("CRPFactory", {
            libraries: {
                BootstrapNftSafeMath: bootstrapNftSafeMath.address,
                RightsManager: rightsManager.address,
                SmartPoolManager: smartPoolManager.address,
            },
        });

        cRPFactory = await CRPFactory.deploy();
        await cRPFactory.deployed();
        console.log("cRPFactory address:", cRPFactory.address)


        // const ESPFactory = await ethers.getContractFactory("ESPFactory", {
        //     libraries: {
        //         BootstrapNftSafeMath: bootstrapNftSafeMath.address,
        //         RightsManager: rightsManager.address,
        //         SmartPoolManager: smartPoolManager.address,
        //     },
        // });
        // const eSPFactory = await ESPFactory.deploy();
        // await eSPFactory.deployed();
        // console.log("eSPFactory address:", eSPFactory.address)

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
                BootstrapNftSafeMath: bootstrapNftSafeMath.address,
                RightsManager: rightsManager.address,
                SmartPoolManager: smartPoolManager.address,
            },
        });

        const admin = accounts[0]
        console.log("admin address:", admin.address)


        testMumuToken = await TToken.deploy('Test Mumu', 'TESTMUMU', 18)
        await testMumuToken.deployed()
        console.log("testMumuToken address:", testMumuToken.address)

        testLalalaToken = await TToken.deploy('Test Lalala', 'TESTLALALA', 18)
        await testLalalaToken.deployed()
        console.log("testLalalaToken address:", testLalalaToken.address)


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
        await testLalalaToken.mint(admin.address, ethers.utils.parseUnits("145000", 18))
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

    describe("two token pair Pool Flow", function () {

        let primaryProxyAddress;
        let crpPoolAddress = ""
        let bpoolAddress = ""
        let bactionIfac = new Interface(BActionABI);

        const initialSupply = ethers.utils
            .parseEther("100")
            .toString();

        const swapFee = ethers.utils
            .parseEther("0.0001")
            .div(100)
            .toString();

        const minimumWeightChangeBlockPeriod = 10;
        const addTokenTimeLockInBlocks = 10;

        const poolTokenSymbol = "TESTMUMU"
        const poolTokenName = "Test Mumu"

        it("should create proxy", async () => {
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            if (primaryProxyAddress.toString() === zeroAddr) {
                await proxyRegistry.connect(primary)["build()"]()
            }
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            // console.log("primaryProxyAddress is :", primaryProxyAddress)
            expect(primaryProxyAddress).not.equal(zeroAddr)
            let aliceProxyAddress = await proxyRegistry.proxies(alice.address)
            // console.log("aliceProxyAddress is :", aliceProxyAddress)
            expect(aliceProxyAddress).to.equal(zeroAddr)
        });
        it("createPool", async () => {
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
            const disableRights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: false,
                canChangeWeights: false,
                canPauseSwapping: false,
                canWhitelistLPs: false,
            };
            const tokens = [
                testMumuToken.address,
                usdc.address
            ]
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

            const data = bactionIfac.encodeFunctionData("createSmartPool", [
                crpFactory,
                bFactory,
                poolParams,
                crpParams,
                rights,
            ]);

            dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)

            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let tx = await dsProxy.connect(primary).execute(bActions.address, data)
            const receipt = await tx.wait()
            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"
            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);
            for (let i = 0; i < receipt.logs.length; i++) {
                let logTemp = receipt.logs[i];
                if (logTemp.topics[0] === newPoolTopic) {
                    let parsedLog = iface.parseLog(logTemp)
                    crpPoolAddress = parsedLog.args["caller"]
                    bpoolAddress = parsedLog.args["pool"]
                    break;
                }
            }
            console.log("logCaller", crpPoolAddress)
            console.log("poolAddress", bpoolAddress)
            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            expect(await crp.symbol()).to.equal(poolTokenSymbol)
            expect(await crp.name()).to.equal(poolTokenName)
            expect(await crp.totalSupply()).to.equal(initialSupply)
            console.log("primary balanceOf", await crp.balanceOf(primary.address))
            expect(await crp.balanceOf(primary.address)).to.equal(initialSupply)

            let bpool = await BPool.attach(bpoolAddress)
            let numTokens = await bpool.getNumTokens()
            let currentTokens = await bpool.getCurrentTokens()

            expect(numTokens).to.equal(2)
            expect(currentTokens[0]).to.equal(testMumuToken.address)
            expect(currentTokens[1]).to.equal(usdc.address)
            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseEther("100").toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseEther("100").toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)


            expect(testMumuTokenBeforeBal.sub(testMumuTokenAfterBal)).to.equal(ethers.utils.parseEther("100").toString())
            expect(usdcTokenBeforeBal.sub(usdcTokenAfterBal)).to.equal(ethers.utils.parseEther("100").toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseEther("100").toString())
        })
        it("add liquidity multi assets", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            const joinSmartPoolData = bactionIfac.encodeFunctionData("joinSmartPool", [
                crpPoolAddress,
                ethers.utils.parseEther("100").toString(),
                [
                    ethers.utils.parseUnits("100000000000000000001", 0).toString(), // need over 1 wei for rounding
                    ethers.utils.parseUnits("100000000000000000001", 0).toString(),
                ]
            ]);

            let joinSmartPoolTx = await dsProxy.connect(primary).execute(bActions.address, joinSmartPoolData)

            console.log("joinSmartPoolTx hash", joinSmartPoolTx.hash)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("200")
                .toString())

            let bpool = await BPool.attach(bpoolAddress)
            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("200000000000000000001", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("200000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenBeforeBal.sub(testMumuTokenAfterBal)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(usdcTokenBeforeBal.sub(usdcTokenAfterBal)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseEther("200").toString())
        })
        it("remove liquidity multi assets", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)

            let exitPoolTx = await crp.connect(primary).exitPool(
                ethers.utils.parseEther("100").toString(),
                ["0", "0"]
            )
            console.log("exitPoolTx hash", exitPoolTx.hash)
            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("100")
                .toString())

            let bpool = await BPool.attach(bpoolAddress)

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("100000000000000000000", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("100000000000000000000", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseEther("100").toString())
        })
        it("add liquidity single assets", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)


            const joinswapExternAmountInData = bactionIfac.encodeFunctionData("joinswapExternAmountIn", [
                crpPoolAddress,
                testMumuToken.address,
                ethers.utils.parseEther("40").toString(),
                "0"
            ]);

            let joinswapExternAmountInTx = await dsProxy.connect(primary).execute(bActions.address, joinswapExternAmountInData)

            console.log("joinswapExternAmountInTx hash", joinswapExternAmountInTx.hash)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("118321587213027381500")

            let bpool = await BPool.attach(bpoolAddress)

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("140000000000000000001", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenBeforeBal.sub(testMumuTokenAfterBal)).to.equal(ethers.utils.parseUnits("40000000000000000000", 0).toString())
            expect(usdcTokenBeforeBal.sub(usdcTokenAfterBal)).to.equal(0)

            let dsProxytestMumuTokenAfterBal = await testMumuToken.balanceOf(dsProxy.address)
            expect(dsProxytestMumuTokenAfterBal).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("118321587213027381500", 0).toString())
        })
        it("remove liquidity single assets", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)


            let exitswapPoolAmountInTx = await crp.connect(primary).exitswapPoolAmountIn(
                testMumuToken.address,
                ethers.utils.parseUnits("18321587213027381500", 0),
                "0"
            )
            console.log("exitswapPoolAmountInTx hash", exitswapPoolAmountInTx.hash)
            expect(await crp.totalSupply()).to.equal("100000000000000000000")

            let bpool = await BPool.attach(bpoolAddress)
            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("100000034281351722182", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.5").toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("39999965718648277819", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let dsProxytestMumuTokenAfterBal = await testMumuToken.balanceOf(dsProxy.address)
            expect(dsProxytestMumuTokenAfterBal).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("100000000000000000000", 0).toString())
        })
        it("set swap enable", async () => {

            let setPublicSwapData = bactionIfac.encodeFunctionData("setPublicSwap", [
                crpPoolAddress,
                false,
            ]);

            let setPublicSwapTx = await dsProxy.connect(primary).execute(bActions.address, setPublicSwapData)

            console.log("setPublicSwapTx hash", setPublicSwapTx.hash)


            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)

            expect(await crp.isPublicSwap()).to.equal(false)

            setPublicSwapData = bactionIfac.encodeFunctionData("setPublicSwap", [
                crpPoolAddress,
                true,
            ]);

            setPublicSwapTx = await dsProxy.connect(primary).execute(bActions.address, setPublicSwapData)
            console.log("setPublicSwapTx hash", setPublicSwapTx.hash)
            expect(await crp.isPublicSwap()).to.equal(true)
        })
        it("set swapFee", async () => {

            const newSwapFee = ethers.utils
                .parseEther("0.2")
                .div(100)
                .toString();

            const setSwapFeeData = bactionIfac.encodeFunctionData("setSwapFee", [
                crpPoolAddress,
                newSwapFee,
            ]);

            let setSwapFeeTx = await dsProxy.connect(primary).execute(bActions.address, setSwapFeeData)
            console.log("setSwapFeeTx hash", setSwapFeeTx.hash)
            let bpool = await BPool.attach(bpoolAddress)
            expect(await bpool.getSwapFee()).to.equal(newSwapFee)
        })
        it("direct increaseWeight", async () => {
            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            const increaseWeightData = bactionIfac.encodeFunctionData("increaseWeight", [
                crpPoolAddress,
                testMumuToken.address,
                ethers.utils.parseEther("27"),
                ethers.utils.parseUnits("21512158589777733264",0)
            ]);

            let increaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("110756075607560756100")

            console.log("increaseWeightTx hash", increaseWeightTx.hash)
            let bpool = await BPool.attach(bpoolAddress)
            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("121512192871129455445", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("27").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseUnits("548557496952458350", 0).toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseUnits("451442503047541650", 0).toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenBeforeBal.sub(testMumuTokenAfterBal)).to.equal(ethers.utils.parseUnits("21512158589777733263", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())


            let dsProxytestMumuTokenAfterBal = await testMumuToken.balanceOf(dsProxy.address)
            expect(dsProxytestMumuTokenAfterBal).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("110756075607560756100", 0).toString())

            let dsproxyAfterBalance = await crp.balanceOf(dsProxy.address)
            expect(dsproxyAfterBalance).to.equal(ethers.utils.parseUnits("0", 0).toString())
        })
        it("direct decreaseWeight", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let bpool = await BPool.attach(bpoolAddress)

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            await crp.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            const decreaseWeightData = bactionIfac.encodeFunctionData("decreaseWeight", [
                crpPoolAddress,
                testMumuToken.address,
                ethers.utils.parseEther("22.22"),
                ethers.utils.parseUnits("10756075607560756130", 0)
                // ethers.utils.parseEther("20")
            ]);

            let decreaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, decreaseWeightData)
            console.log("decreaseWeightTx hash", decreaseWeightTx.hash)

            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("99999999999999999970")

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("100000034281351722226", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("22.22").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("21512158589777733219", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("99999999999999999970", 0).toString())
            let dsproxyAfterBalance = await crp.balanceOf(dsProxy.address)
            expect(dsproxyAfterBalance).to.equal(ethers.utils.parseUnits("0", 0).toString())
        })
        it("gradually  updateWeight", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let currentBlockNumber = await ethers.provider.getBlockNumber()
            let startBlockNumber = currentBlockNumber + 10
            let endBlockNumber = startBlockNumber + 20

            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)
            let bpool = await BPool.attach(bpoolAddress)
            const newWeights = [
                ethers.utils.parseEther("15.22").toString(),
                ethers.utils.parseEther("30.22").toString()
            ];
            const increaseWeightData = bactionIfac.encodeFunctionData("updateWeightsGradually", [
                crpPoolAddress,
                newWeights,
                startBlockNumber,
                endBlockNumber,
            ]);
            let increaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData)
            console.log("increaseWeightTx hash", increaseWeightTx.hash)
            await advanceBlockTo(startBlockNumber + 1)

            for (let i = startBlockNumber + 1; i < endBlockNumber; i++) {
                console.log("current block:", await ethers.provider.getBlockNumber())
                await crp.connect(primary).pokeWeights()
                testTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
                usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

                console.log("testTokenWeight", testTokenWeight)
                console.log("usdcTokenWeight", usdcTokenWeight)
                testTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
                usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

                console.log("testTokenDWeight", testTokenDWeight)
                console.log("usdcTokenDWeight", usdcTokenDWeight)
            }
            await advanceBlockTo(endBlockNumber + 1)

            await crp.connect(primary).pokeWeights()
            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("99999999999999999970")

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("100000034281351722226", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("15.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("30.22").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseUnits("334947183098591549", 0).toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseUnits("665052816901408451", 0).toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("99999999999999999970", 0).toString())



            const newWeights2 = [
                ethers.utils.parseEther("10.22").toString(),
                ethers.utils.parseEther("10.22").toString()
            ];
             currentBlockNumber = await ethers.provider.getBlockNumber()
             startBlockNumber = currentBlockNumber + 10
             endBlockNumber = startBlockNumber + 20

            const increaseWeightData2 = bactionIfac.encodeFunctionData("updateWeightsGradually", [
                crpPoolAddress,
                newWeights2,
                startBlockNumber,
                endBlockNumber,
            ]);
            let increaseWeightTx2 = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData2)


            await advanceBlockTo(endBlockNumber + 1)

            await crp.connect(primary).pokeWeights()
            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("99999999999999999970")

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("100000034281351722226", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("100000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("10.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("10.22").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())

             testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
             usdcTokenAfterBal = await usdc.balanceOf(primary.address)

            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())
            expect(usdcTokenAfterBal.sub(usdcTokenBeforeBal)).to.equal(ethers.utils.parseUnits("0", 0).toString())

             crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("99999999999999999970", 0).toString())


        })
        it("swap in", async () => {

            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)


            let crp = await ConfigurableRightsPool.attach(crpPoolAddress)

            let bpool = await BPool.attach(bpoolAddress)
            await testMumuToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())


            let testTokenBalance = await bpool.getBalance(testMumuToken.address)
            let usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testTokenBalance", testTokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)

            let swap = {
                pool: bpoolAddress,
                tokenIn: usdc.address,
                tokenOut: testMumuToken.address,
                swapAmount: ethers.utils.parseEther("10").toString(),
                limitReturnAmount: 0,
                maxPrice: ethers.utils.parseEther("100").toString(),
            }

            let swapInTx = await exchangeProxy.connect(primary).multihopBatchSwapExactIn(
                [[swap]],
                usdc.address,
                testMumuToken.address,
                ethers.utils.parseEther("10").toString(),
                '0')

            console.log("swapInTx hash", swapInTx.hash)


            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("99999999999999999970")

            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseUnits("90925654011049029082", 0).toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseUnits("110000000000000000001", 0).toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("10.22").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("10.22").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseUnits("500000000000000000", 0).toString())

            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)
            expect(testMumuTokenAfterBal.sub(testMumuTokenBeforeBal)).to.equal(ethers.utils.parseUnits("9074380270302693144", 0).toString())
            expect(usdcTokenBeforeBal.sub(usdcTokenAfterBal)).to.equal(ethers.utils.parseUnits("10000000000000000000", 0).toString())
            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseUnits("99999999999999999970", 0).toString())
        })

    })
    describe("three token pair Pool Flow", function () {

        let primaryProxyAddress;
        let poolAddress = ""
        let logCaller = ""
        let ifac

        const initialSupply = ethers.utils
            .parseEther("100")
            .toString();

        const swapFee = ethers.utils
            .parseEther("0.0001")
            .div(100)
            .toString();

        const minimumWeightChangeBlockPeriod = 10;
        const addTokenTimeLockInBlocks = 10;

        const poolTokenSymbol = "TESTMUMU"
        const poolTokenName = "Test Mumu"


        it("should get proxy", async () => {
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            if (primaryProxyAddress.toString() === zeroAddr) {
                await proxyRegistry.connect(primary)["build()"]()
            }
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            expect(primaryProxyAddress).not.equal(zeroAddr)
        });

        it("createPool", async () => {

            const tokenBal = [
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString(),
                ethers.utils.parseEther("100").toString()
            ];
            const weights = [
                ethers.utils.parseEther("11.11").toString(),
                ethers.utils.parseEther("11.11").toString(),
                ethers.utils.parseEther("11.11").toString()
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: true,
                canChangeWeights: true,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };

            const tokens = [
                testMumuToken.address,
                testLalalaToken.address,
                usdc.address
            ]
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
            ifac = new Interface(BActionABI);


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
            dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)

            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await testLalalaToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("1000").toString())


            let testLalaTokenBeforeBal = await testLalalaToken.balanceOf(primary.address)
            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)


            let tx = await dsProxy.connect(primary).execute(bActions.address, data)

            console.log("tx hash", tx.hash)

            const receipt = await tx.wait()
            // console.log(receipt.logs)
            let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

            let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
            let iface = new ethers.utils.Interface(abi);
            let poolAddressHashStr = ""
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

            expect(numTokens).to.equal(3)
            expect(currentTokens[0]).to.equal(testMumuToken.address)
            expect(currentTokens[1]).to.equal(testLalalaToken.address)
            expect(currentTokens[2]).to.equal(usdc.address)


            expect(await bpool.getBalance(testLalalaToken.address)).to.equal(ethers.utils.parseEther("100").toString())
            expect(await bpool.getBalance(testMumuToken.address)).to.equal(ethers.utils.parseEther("100").toString())
            expect(await bpool.getBalance(usdc.address)).to.equal(ethers.utils.parseEther("100").toString())
            expect(await bpool.getDenormalizedWeight(testLalalaToken.address)).to.equal(ethers.utils.parseEther("11.11").toString())
            expect(await bpool.getDenormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("11.11").toString())
            expect(await bpool.getDenormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("11.11").toString())
            expect(await bpool.getNormalizedWeight(testMumuToken.address)).to.equal(ethers.utils.parseEther("0.333333333333333333").toString())
            expect(await bpool.getNormalizedWeight(testLalalaToken.address)).to.equal(ethers.utils.parseEther("0.333333333333333333").toString())
            expect(await bpool.getNormalizedWeight(usdc.address)).to.equal(ethers.utils.parseEther("0.333333333333333333").toString())

            let testLalaTokenAfterBal = await testLalalaToken.balanceOf(primary.address)
            let testMumuTokenAfterBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenAfterBal = await usdc.balanceOf(primary.address)


            expect(testLalaTokenBeforeBal.sub(testLalaTokenAfterBal)).to.equal(ethers.utils.parseEther("100").toString())
            expect(testMumuTokenBeforeBal.sub(testMumuTokenAfterBal)).to.equal(ethers.utils.parseEther("100").toString())
            expect(usdcTokenBeforeBal.sub(usdcTokenAfterBal)).to.equal(ethers.utils.parseEther("100").toString())

            let crpAfterBalance = await crp.balanceOf(primary.address)
            expect(crpAfterBalance).to.equal(ethers.utils.parseEther("100").toString())
        })
        it("add liquidity multi assets", async () => {


            let testLalaTokenBeforeBal = await testLalalaToken.balanceOf(primary.address)
            let testMumuTokenBeforeBal = await testMumuToken.balanceOf(primary.address)
            let usdcTokenBeforeBal = await usdc.balanceOf(primary.address)

            let bpool = await BPool.attach(poolAddress)


            const joinSmartPoolData = ifac.encodeFunctionData("joinSmartPool", [
                logCaller,
                ethers.utils.parseEther("100").toString(),
                [
                    ethers.utils.parseUnits("100000000000000000001", 0).toString(),
                    ethers.utils.parseUnits("100000000000000000001", 0).toString(),
                    ethers.utils.parseUnits("100000000000000000001", 0).toString(),
                ]
            ]);

            let joinSmartPoolTx = await dsProxy.connect(primary).execute(bActions.address, joinSmartPoolData)

            console.log("joinSmartPoolTx hash", joinSmartPoolTx.hash)

            let crp = await ConfigurableRightsPool.attach(logCaller)
            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("200")
                .toString())


            testMUMUTokenBalance = await bpool.getBalance(testMumuToken.address)
            testLALATokenBalance = await bpool.getBalance(testLalalaToken.address)
            usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testMUMUTokenBalance", testMUMUTokenBalance)
            console.log("testLALATokenBalance", testLALATokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)
        })
        it("remove liquidity multi assets", async () => {

            let bpool = await BPool.attach(poolAddress)
            let testMUMUTokenBalance = await bpool.getBalance(testMumuToken.address)
            let testLALATokenBalance = await bpool.getBalance(testLalalaToken.address)
            let usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testMUMUTokenBalance", testMUMUTokenBalance)
            console.log("testLALATokenBalance", testLALATokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)

            let crp = await ConfigurableRightsPool.attach(logCaller)

            let exitPoolTx = crp.connect(primary).exitPool(
                ethers.utils.parseEther("100").toString(),
                ["0", "0", "0"]
            )
            console.log("exitPoolTx hash", exitPoolTx.hash)

            expect(await crp.totalSupply()).to.equal(ethers.utils
                .parseEther("100")
                .toString())

            testMUMUTokenBalance = await bpool.getBalance(testMumuToken.address)
            testLALATokenBalance = await bpool.getBalance(testLalalaToken.address)
            usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testMUMUTokenBalance", testMUMUTokenBalance)
            console.log("testLALATokenBalance", testLALATokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)
        })
        it("add liquidity single assets", async () => {

            const joinswapExternAmountInData = ifac.encodeFunctionData("joinswapExternAmountIn", [
                logCaller,
                testMumuToken.address,
                ethers.utils.parseEther("40").toString(),
                "0"
            ]);

            let joinswapExternAmountInTx = await dsProxy.connect(primary).execute(bActions.address, joinswapExternAmountInData)

            console.log("joinswapExternAmountInTx hash", joinswapExternAmountInTx.hash)

            let crp = await ConfigurableRightsPool.attach(logCaller)
            console.log("total supply", await crp.totalSupply())
            expect(await crp.totalSupply()).to.equal("111868887103979119700")

            let bpool = await BPool.attach(poolAddress)

            let testTokenBalance = await bpool.getBalance(testMumuToken.address)
            let usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testTokenBalance", testTokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)
        })
        it("remove liquidity single assets", async () => {

            let crp = await ConfigurableRightsPool.attach(logCaller)

            let exitswapPoolAmountInTx = await crp.connect(primary).exitswapPoolAmountIn(
                testMumuToken.address,
                ethers.utils.parseEther("10").toString(),
                "0"
            )
            console.log("exitswapPoolAmountInTx hash", exitswapPoolAmountInTx.hash)
            expect(await crp.totalSupply()).to.equal("101868887103979119700")

            let bpool = await BPool.attach(poolAddress)
            let testTokenBalance = await bpool.getBalance(testMumuToken.address)
            let usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testTokenBalance", testTokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)
        })
        it("set swap enable", async () => {

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

            const increaseWeightData = ifac.encodeFunctionData("increaseWeight", [
                logCaller,
                testMumuToken.address,
                ethers.utils.parseEther("16"),
                ethers.utils.parseEther("100").toString(),
            ]);


            let increaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData)
            console.log("increaseWeightTx hash", increaseWeightTx.hash)
            let bpool = await BPool.attach(poolAddress)
            testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testMumuTokenWeight", testMumuTokenWeight)
            console.log("testLalaTokenWeight", testLalaTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testMumuTokenDWeight", testMumuTokenDWeight)
            console.log("testLalaTokenDWeight", testLalaTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)
        })
        it("direct decreaseWeight", async () => {

            let bpool = await BPool.attach(poolAddress)
            testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testMumuTokenWeight", testMumuTokenWeight)
            console.log("testLalaTokenWeight", testLalaTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testMumuTokenDWeight", testMumuTokenDWeight)
            console.log("testLalaTokenDWeight", testLalaTokenDWeight)
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

            testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testMumuTokenWeight", testMumuTokenWeight)
            console.log("testLalaTokenWeight", testLalaTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testMumuTokenDWeight", testMumuTokenDWeight)
            console.log("testLalaTokenDWeight", testLalaTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)
        })
        it("gradually  updateWeight", async () => {

            let currentBlockNumber = await ethers.provider.getBlockNumber()
            let startBlockNumber = currentBlockNumber + 10
            let endBlockNumber = startBlockNumber + 20

            let bpool = await BPool.attach(poolAddress)
            testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testMumuTokenWeight", testMumuTokenWeight)
            console.log("testLalaTokenWeight", testLalaTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testMumuTokenDWeight", testMumuTokenDWeight)
            console.log("testLalaTokenDWeight", testLalaTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)

            const newWeights = [
                ethers.utils.parseEther("9.11").toString(),
                ethers.utils.parseEther("15.11").toString(),
                ethers.utils.parseEther("15.11").toString()
            ];


            const increaseWeightData = ifac.encodeFunctionData("updateWeightsGradually", [
                logCaller,
                newWeights,
                startBlockNumber,
                endBlockNumber,
            ]);

            let increaseWeightTx = await dsProxy.connect(primary).execute(bActions.address, increaseWeightData)
            console.log("increaseWeightTx hash", increaseWeightTx.hash)
            await advanceBlockTo(startBlockNumber + 1)
            let crp = await ConfigurableRightsPool.attach(logCaller)

            for (let i = startBlockNumber + 1; i < endBlockNumber; i++) {
                console.log("current block:", await ethers.provider.getBlockNumber())
                await crp.connect(primary).pokeWeights()
                testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
                testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
                usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

                console.log("testMumuTokenWeight", testMumuTokenWeight)
                console.log("testLalaTokenWeight", testLalaTokenWeight)
                console.log("usdcTokenWeight", usdcTokenWeight)
                testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
                testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
                usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

                console.log("testMumuTokenDWeight", testMumuTokenDWeight)
                console.log("testLalaTokenDWeight", testLalaTokenDWeight)
                console.log("usdcTokenDWeight", usdcTokenDWeight)
            }
            await advanceBlockTo(endBlockNumber + 1)

            await crp.connect(primary).pokeWeights()
            testMumuTokenWeight = await bpool.getNormalizedWeight(testMumuToken.address)
            testLalaTokenWeight = await bpool.getNormalizedWeight(testLalalaToken.address)
            usdcTokenWeight = await bpool.getNormalizedWeight(usdc.address)

            console.log("testMumuTokenWeight", testMumuTokenWeight)
            console.log("testLalaTokenWeight", testLalaTokenWeight)
            console.log("usdcTokenWeight", usdcTokenWeight)
            testMumuTokenDWeight = await bpool.getDenormalizedWeight(testMumuToken.address)
            testLalaTokenDWeight = await bpool.getDenormalizedWeight(testLalalaToken.address)
            usdcTokenDWeight = await bpool.getDenormalizedWeight(usdc.address)

            console.log("testMumuTokenDWeight", testMumuTokenDWeight)
            console.log("testLalaTokenDWeight", testLalaTokenDWeight)
            console.log("usdcTokenDWeight", usdcTokenDWeight)

        })
        it("swap in", async () => {

            let bpool = await BPool.attach(poolAddress)
            await testMumuToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await testLalalaToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())


            let testTokenBalance = await bpool.getBalance(testMumuToken.address)
            let usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testTokenBalance", testTokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)

            let swap = {
                pool: poolAddress,
                tokenIn: usdc.address,
                tokenOut: testMumuToken.address,
                swapAmount: ethers.utils.parseEther("10").toString(),
                limitReturnAmount: 0,
                maxPrice: ethers.utils.parseEther("100").toString(),
            }

            let swapInTx = await exchangeProxy.connect(primary).multihopBatchSwapExactIn(
                [[swap]],
                usdc.address,
                testMumuToken.address,
                ethers.utils.parseEther("10").toString(),
                '0')

            console.log("swapInTx hash", swapInTx.hash)


            testTokenBalance = await bpool.getBalance(testMumuToken.address)
            usdcTokenBalance = await bpool.getBalance(usdc.address)

            console.log("testTokenBalance", testTokenBalance)
            console.log("usdcTokenBalance", usdcTokenBalance)

        })
    })
    describe("sor swap", function () {

        let primaryProxyAddress;
        let poolAddress = ""
        let logCaller = ""
        let ifac

        const initialSupply = ethers.utils
            .parseEther("10000")
            .toString();

        const swapFee = ethers.utils
            .parseEther("0.0001")
            .div(100)
            .toString();

        const minimumWeightChangeBlockPeriod = 10;
        const addTokenTimeLockInBlocks = 10;

        const poolTokenSymbol = "TESTMUMU"
        const poolTokenName = "Test Mumu"

        let crpPools = []
        let bPools = []


        it("should get proxy", async () => {
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            if (primaryProxyAddress.toString() === zeroAddr) {
                await proxyRegistry.connect(primary)["build()"]()
            }
            primaryProxyAddress = await proxyRegistry.proxies(primary.address)
            console.log("primaryProxyAddress is :", primaryProxyAddress)
            expect(primaryProxyAddress).not.equal(zeroAddr)
        });

        it("createPool", async () => {

            const tokenBal = [
                ethers.utils.parseEther("10000").toString(),
                ethers.utils.parseEther("10000").toString(),
            ];
            const weights = [
                ethers.utils.parseEther("11.11").toString(),
                ethers.utils.parseEther("11.11").toString(),
            ];

            const rights = {
                canAddRemoveTokens: false,
                canChangeCap: false,
                canChangeSwapFee: true,
                canChangeWeights: true,
                canPauseSwapping: true,
                canWhitelistLPs: false,
            };


            const poolTokens = [
                [
                    testMumuToken.address,
                    testLalalaToken.address,
                ],
                [
                    testLalalaToken.address,
                    usdc.address,
                ],
                [
                    usdc.address,
                    bal.address,
                ]
            ]
            const crpParams = {
                initialSupply,
                minimumWeightChangeBlockPeriod,
                addTokenTimeLockInBlocks,
            };

            const poolTokenSymbols = ["TESTMUMU1", "TESTMUMU2", "TESTMUMU3"]
            const poolTokenNames = ["Test Mumu1", "Test Mumu2", "Test Mumu3"]
            let poolParams = [
                {
                    poolTokenSymbol: poolTokenSymbols[0],
                    poolTokenName: poolTokenNames[0],
                    constituentTokens: poolTokens[0],
                    tokenBalances: tokenBal,
                    tokenWeights: weights,
                    swapFee: swapFee,
                },
                {
                    poolTokenSymbol: poolTokenSymbols[1],
                    poolTokenName: poolTokenNames[1],
                    constituentTokens: poolTokens[1],
                    tokenBalances: tokenBal,
                    tokenWeights: weights,
                    swapFee: swapFee,
                },
                {
                    poolTokenSymbol: poolTokenSymbols[2],
                    poolTokenName: poolTokenNames[2],
                    constituentTokens: poolTokens[2],
                    tokenBalances: tokenBal,
                    tokenWeights: weights,
                    swapFee: swapFee,
                }
            ]

            const crpFactory = cRPFactory.address;
            const bFactory = bfactory.address;
            ifac = new Interface(BActionABI);

            let datas = []
            for (let i = 0; i < 3; i++) {
                datas.push(
                    ifac.encodeFunctionData("createSmartPool", [
                        crpFactory,
                        bFactory,
                        poolParams[i],
                        crpParams,
                        rights,
                    ])
                )
            }

            dsProxy = await DsProxy.attach(primaryProxyAddress)
            console.log("dsProxy is :", dsProxy.address)

            await testMumuToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("100000").toString())
            await testLalalaToken.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("100000").toString())
            await usdc.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("100000").toString())
            await bal.connect(primary).approve(dsProxy.address, ethers.utils.parseEther("100000").toString())


            for (let i = 0; i < 3; i++) {
                let tx = await dsProxy.connect(primary).execute(bActions.address, datas[i])
                let [crpPoolAddress, poolAddress] = await getPoolAddress(tx)
                console.log("crpPoolAddress, poolAddress", crpPoolAddress, poolAddress)
                crpPools.push(crpPoolAddress)
                bPools.push(poolAddress)
            }

            for (let i = 0; i < 3; i++) {
                let logCaller = crpPools[i]
                let poolAddress = bPools[i]
                let crp = await ConfigurableRightsPool.attach(logCaller)
                expect(await crp.symbol()).to.equal(poolTokenSymbols[i])
                expect(await crp.name()).to.equal(poolTokenNames[i])
                expect(await crp.totalSupply()).to.equal(initialSupply)
            }


        })
        // it("swap in from one pool", async () => {
        //
        //     await testMumuToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await testLalalaToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await usdc.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await bal.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //
        //
        //     let beforeLalaBalance = await testLalalaToken.connect(primary).balanceOf(primary.address)
        //     console.log("beforeLalaBalance", beforeLalaBalance)
        //
        //     let swaps = [
        //         {
        //             pool: bPools[0],
        //             tokenIn: testMumuToken.address,
        //             tokenOut: testLalalaToken.address,
        //             swapAmount: ethers.utils.parseEther("10").toString(),
        //             limitReturnAmount: 0,
        //             maxPrice: ethers.utils.parseEther("100").toString(),
        //         },
        //     ]
        //
        //     let swapInTx = await exchangeProxy.connect(primary).multihopBatchSwapExactIn(
        //         [swaps],
        //         testMumuToken.address,
        //         testLalalaToken.address,
        //         ethers.utils.parseEther("10").toString(),
        //         '0')
        //
        //     console.log("swapInTx hash", swapInTx.hash)
        //
        //     let afterLalaBalance = await testLalalaToken.connect(primary).balanceOf(primary.address)
        //     console.log("afterLalaBalance", afterLalaBalance)
        //     console.log("diffLalaBalance", afterLalaBalance.sub(beforeLalaBalance))
        //
        // })
        // it("swap in from two pools", async () => {
        //
        //     await testMumuToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await testLalalaToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await usdc.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //     await bal.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
        //
        //
        //     let beforeUsdcBalance = await usdc.connect(primary).balanceOf(primary.address)
        //     console.log("beforeUsdcBalance", beforeUsdcBalance)
        //
        //     let swaps = [
        //         {
        //             pool: bPools[0],
        //             tokenIn: testMumuToken.address,
        //             tokenOut: testLalalaToken.address,
        //             swapAmount: ethers.utils.parseEther("10").toString(),
        //             limitReturnAmount: 0,
        //             maxPrice: ethers.utils.parseEther("100").toString(),
        //         },
        //         {
        //             pool: bPools[1],
        //             tokenIn: testLalalaToken.address,
        //             tokenOut: usdc.address,
        //             swapAmount: ethers.utils.parseEther("10").toString(),
        //             limitReturnAmount: 0,
        //             maxPrice: ethers.utils.parseEther("100").toString(),
        //         }
        //     ]
        //
        //     let swapInTx = await exchangeProxy.connect(primary).multihopBatchSwapExactIn(
        //         [swaps],
        //         testMumuToken.address,
        //         usdc.address,
        //         ethers.utils.parseEther("10").toString(),
        //         '0')
        //
        //     console.log("swapInTx hash", swapInTx.hash)
        //
        //     let afterUsdcBalance = await usdc.connect(primary).balanceOf(primary.address)
        //     console.log("afterUsdcBalance", afterUsdcBalance)
        //     console.log("diffUsdcBalance", afterUsdcBalance.sub(beforeUsdcBalance))
        //
        // })
        it("swap in from three pools", async () => {

            await testMumuToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await testLalalaToken.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await usdc.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())
            await bal.connect(primary).approve(exchangeProxy.address, ethers.utils.parseEther("1000").toString())


            let beforeBalBalance = await bal.connect(primary).balanceOf(primary.address)
            console.log("beforeBalBalance", beforeBalBalance)

            let swaps = [
                {
                    pool: bPools[0],
                    tokenIn: testMumuToken.address,
                    tokenOut: testLalalaToken.address,
                    swapAmount: ethers.utils.parseEther("10").toString(),
                    limitReturnAmount: 0,
                    maxPrice: ethers.utils.parseEther("100").toString(),
                },
                {
                    pool: bPools[1],
                    tokenIn: testLalalaToken.address,
                    tokenOut: usdc.address,
                    swapAmount: ethers.utils.parseEther("20").toString(),
                    limitReturnAmount: 0,
                    maxPrice: ethers.utils.parseEther("100").toString(),
                },
                {
                    pool: bPools[2],
                    tokenIn: usdc.address,
                    tokenOut: bal.address,
                    swapAmount: ethers.utils.parseEther("20").toString(),
                    limitReturnAmount: 0,
                    maxPrice: ethers.utils.parseEther("100").toString(),
                }
            ]

            let swapInTx = await exchangeProxy.connect(primary).multihopBatchSwapExactIn(
                [swaps],
                testMumuToken.address,
                bal.address,
                ethers.utils.parseEther("10").toString(),
                '0')

            console.log("swapInTx hash", swapInTx.hash)

            let afterBalBalance = await bal.connect(primary).balanceOf(primary.address)
            console.log("afterBalBalance", afterBalBalance)
            console.log("diffBalBalance", afterBalBalance.sub(beforeBalBalance))

        })
    })
})


async function getPoolAddress(tx) {
    let poolAddress = ""
    let logCaller = ""
    const receipt = await tx.wait()
    // console.log(receipt.logs)
    let newPoolTopic = "0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945"

    let abi = ["event LOG_NEW_POOL(address indexed caller, address indexed pool)"];
    let iface = new ethers.utils.Interface(abi);
    let poolAddressHashStr = ""
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
    return [logCaller, poolAddress]
}