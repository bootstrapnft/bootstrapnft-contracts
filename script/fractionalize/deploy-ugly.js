const {BigNumber} = require("@ethersproject/bignumber");
const {ethers, upgrades} = require("hardhat");

const notZeroAddr = "0x000000000000000000000000000000000000dead";

const ownerAddress = "";

async function main() {
    const [deployer,alice] = await ethers.getSigners();

    console.log("Deploying account:", await deployer.getAddress());
    console.log(
        "Deploying account balance:",
        (await deployer.getBalance()).toString(),
        "\n"
    );

    const StakingProvider = await ethers.getContractFactory(
        "MockStakingProvider"
    );
    const provider = await StakingProvider.deploy();
    await provider.deployed();
    console.log("MockStakingProvider:", provider.address);

    const Staking = await ethers.getContractFactory("LPStaking");
    staking = await upgrades.deployProxy(Staking, [provider.address], {
        initializer: "__LPStaking__init",
        unsafeAllow: 'delegatecall'
    });
    await staking.deployed();
    console.log("Staking:", staking.address);

    const Vault = await ethers.getContractFactory("VaultUpgradeable");
    const vault = await Vault.deploy();
    await vault.deployed();
    console.log("Vault template:", vault.address);

    // const FeeDistributor = await ethers.getContractFactory("SimpleFeeDistributor");
    // const feeDistrib = await upgrades.deployProxy(
    //   FeeDistributor,
    //   [staking.address, notZeroAddr],
    //   {
    //     initializer: "__SimpleFeeDistributor__init__",
    //     unsafeAllow: 'delegatecall'
    //   }
    // );
    // await feeDistrib.deployed();

    const FeeDistributor = await ethers.getContractFactory(
        "SimpleFeeDistributor"
    );
    const feeDistrib = await upgrades.deployProxy(
        FeeDistributor,
        [staking.address, notZeroAddr],
        {
            initializer: "__SimpleFeeDistributor__init__",
            unsafeAllow: 'delegatecall'
        }
    );
    await feeDistrib.deployed();
    console.log("FeeDistributor:", feeDistrib.address);

    const VaultFactory = await ethers.getContractFactory("VaultFactoryUpgradeable");
    vaultFactory = await upgrades.deployProxy(VaultFactory, [vault.address, feeDistrib.address], {
        initializer: "__VaultFactory_init",
        unsafeAllow: 'delegatecall'
    });
    await vaultFactory.deployed();
    console.log("VaultFactory:", vaultFactory.address);

    await feeDistrib.setVaultFactory(vaultFactory.address);
    await staking.setVaultFactory(vaultFactory.address);


    const ProxyController = await ethers.getContractFactory("ProxyController");

    const proxyController = await ProxyController.deploy(
        vaultFactory.address,
        staking.address,
        feeDistrib.address
    );
    await proxyController.deployed();
    console.log("ProxyController address:", proxyController.address);
    await upgrades.admin.changeProxyAdmin(vaultFactory.address, proxyController.address);
    await upgrades.admin.changeProxyAdmin(
        staking.address,
        proxyController.address
    );
    await upgrades.admin.changeProxyAdmin(
        feeDistrib.address,
        proxyController.address
    );

    // await proxyController.fetchImplAddress(0, {
    //     gasLimit: "150000",
    // });
    // await proxyController.fetchImplAddress(1, {
    //     gasLimit: "150000",
    // });
    // await proxyController.fetchImplAddress(2, {
    //     gasLimit: "150000",
    // });

    if (ownerAddress) {
        await provider.transferOwnership(ownerAddress);
        await staking.transferOwnership(ownerAddress);
        await feeDistrib.transferOwnership(ownerAddress);
        await vaultFactory.transferOwnership(ownerAddress);
        await proxyController.transferOwnership(ownerAddress);
    }
}

main()
    .then(() => {
        console.log("\nDeployment completed successfully ✓");
        process.exit(0);
    })
    .catch((error) => {
        console.log("\nDeployment failed ✗");
        console.error(error);
        process.exit(1);
    });
