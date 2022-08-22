require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        sources: "./contracts",
    },
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        ropsten: {
            url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        bsctest: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        rinkeby: {
            url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY_API_KEY}`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        arbitrumTestnet: {
            url: `https://rinkeby.arbitrum.io/rpc`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        arbitrum: {
            url: `https://arb1.arbitrum.io/rpc`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        mumbai: {
            url: `https://rpc-mumbai.matic.today`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        aurora: {
            url: `https://testnet.aurora.dev`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        shibuya: {
            url: `https://evm.shibuya.astar.network`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
        moonbase: {
            url: `https://rpc.api.moonbase.moonbeam.network`,
            accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY2}`]
        },
    }
};
