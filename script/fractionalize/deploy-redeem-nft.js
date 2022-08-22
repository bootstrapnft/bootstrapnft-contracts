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
    const Nftx = await ethers.getContractFactory("NFTXVaultFactoryUpgradeable");
    let nftx = await Nftx.attach("0xB757Bd6b4430d8Cd2Ed678A4d86E8e6b2E6ebd1d")
    // const vaultId = await nftx.connect(deployer).createVault("CryptoPandas", "PANDA", "0xa2a12f92CcEb839ce1d1b648557269157a05C810", false, true);
    const vaultAddr = await nftx.vault(0);
    const vaultArtifact = await artifacts.readArtifact("NFTXVaultUpgradeable");
    const vault = new ethers.Contract(
        vaultAddr,
        vaultArtifact.abi,
        ethers.provider
    );
    // const assetAddress = await vault.assetAddress()
    const tokenId = 1;
    // const Erc721 = await ethers.getContractFactory("MockERC721");
    // const erc721 = await Erc721.attach(assetAddress);
    // await erc721.connect(deployer).approve(vault.address, tokenId);
    let mintResult = await vault.connect(deployer).redeem(1, [tokenId])

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
