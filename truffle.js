const HDWalletProvider = require("truffle-hdwallet-provider");

require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*', // Match any network id
      gas: 4500000,
      gasPrice: 21
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 3,
      gas: 3000000,
      gasPrice: 21
    },
    // main ethereum network(mainnet)
    main: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 1,
      gas: 3000000,
      gasPrice: 21
    }
  }
}

//********************
//   alternative config
// **********************

// module.exports = {
//   build: {
//     "index.html": "index.html",
//     "index_2.html": "index_2.html",
//     "interaction.html": "interaction.html",
//     "app.js": [
//       "javascripts/app.js"
//     ],
//     "app.css": [
//       "stylesheets/app.css"
//     ],
//     "concise.min.css": "stylesheets/concise/concise.min.css",
//     "masthead.css": "stylesheets/masthead.css",
//     "dev.css": "stylesheets/dev.css",
//     "images/": "images/"
//   },
//   deploy: [
//     "Mortal",
//     "Bet"
//   ],
//   rpc: {
//     host: "localhost",
//     port: 8545
//   }
// };
// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // for more about customizing your Truffle configuration!
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 7545,
//       network_id: "*" // Match any network id
//     }
//   }
// };
