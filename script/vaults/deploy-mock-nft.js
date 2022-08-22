const {BigNumber} = require("@ethersproject/bignumber");
const {ethers, upgrades} = require("hardhat");

const notZeroAddr = "0x000000000000000000000000000000000000dead";

const ownerAddress = "";
const numLoops = 10;
const numTokenIds = numLoops * 2;

async function main() {
    const [deployer, alice] = await ethers.getSigners();
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
    const Erc721 = await ethers.getContractFactory("MockERC721");
    erc721 = await Erc721.deploy(`CryptoPandas`, `CRYPTOPANDAS`);
    await erc721.deployed();
    // erc721 = await Erc721.attach("0xa2a12f92CcEb839ce1d1b648557269157a05C810");
    console.log("erc721:", erc721.address);

    const Erc1155 = await ethers.getContractFactory("MockERC1155");
    erc1155 = await Erc1155.deploy("");
    await erc1155.deployed();
    // erc1155 = await Erc1155.attach("0x077d5D1af09ea7dbc85D2d4Cad9f3C91200dDA4a");
    console.log("erc1155:", erc1155.address);

    for (let i = 0; i < 20; i++) {
        await erc721.publicMint(deployer.address, i);
        await erc1155.publicMint(deployer.address, i, 1);
    }
    for (let i = 20; i < 40; i++) {
        await erc721.publicMint(alice.address, i);
        await erc1155.publicMint(alice.address, i, 1);
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
