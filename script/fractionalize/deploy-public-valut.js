const {BigNumber} = require("@ethersproject/bignumber");
const {ethers, upgrades} = require("hardhat");

const notZeroAddr = "0x000000000000000000000000000000000000dead";

const ownerAddress = "";
const numLoops = 10;
const numTokenIds = numLoops * 2;

async function main() {
    const [deployer,alice] = await ethers.getSigners();
    console.log("Deploying account:", await deployer.getAddress());
    console.log(
        "Deploying account balance:",
        (await deployer.getBalance()).toString(),
        "\n"
    );
    console.log("Deploying account:", await alice.getAddress());
    console.log(
        "Deploying account balance:",
        (await alice.getBalance()).toString(),
        "\n"
    );
    const VaultFactory = await ethers.getContractFactory("VaultFactoryUpgradeable");
    let vaultFactory = await VaultFactory.attach("0x3De3766971f8d2281CcDEcA54075bc14Dc13Edfc")
    // const vaultId = await vaultFactory.connect(deployer).createVault("CryptoPandas", "PANDA", "0xa2a12f92CcEb839ce1d1b648557269157a05C810", false, true);
    const vaultAddr = await vaultFactory.vault(5);
    const vaultArtifact = await artifacts.readArtifact("VaultUpgradeable");
    const vault = new ethers.Contract(
        vaultAddr,
        vaultArtifact.abi,
        ethers.provider
    );
    let mintResult = await vault.connect(deployer).finalizeVault()

    console.log("mint result", mintResult);
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
