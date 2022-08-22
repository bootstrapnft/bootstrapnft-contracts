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
    const vaultId = await nftx.connect(deployer).createVault("CryptoPandas", "PANDA", "0xf33a3efDDA0399D1E57a612D10EA2B122c662102", false, true);
    console.log("create vault Id:", await vaultId.wait());
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
