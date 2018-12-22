# Smart Contract Lending CLub

##Installation
---
`npm install`

create a .env file with

`MNEMONIC` a menomic passphrase for ethereum private key (e.g from metamask)
`INFURA_API_KEY` get an infura API key if you want to use it to deploy to ropsten or main

## Testing and Considerations
---
Migrate the Contract with

`truffle migrate --reset --network development`

and start testing with

`truffle test`

in order to test the front-end run

`lite-server`
or
`node expressServer.js`


- I highly recommend Ganach and Truffle for testing purposes

- If you want to deploy contracts with a constructor to set the contract Details which will lead to only one transaction on deployment, please consider that the truffle web3 functions and thus Promises will not work. You will have to fall back to the old Meta Mask web3 Instance with call back functions you can find it's documentation [here](https://github.com/ethereum/wiki/wiki/JavaScript-API)
and deploy contracts with the `compileContract.js` file

-  If the pesudo random function is not safe eneough for you consider using the [Oracalize](http://www.oraclize.it/) example in the contracts directory. It uses the wolfram alpha api for randomness which is safter but will costs more gas.



##Deployment
---

configure and then run `expressServer.js` with pm2 for example. This is an example Nginx config:

`
 upstream yourdomainname.com {
          server 127.0.0.1:3009;
          keepalive 8;
}

server {
   listen 80;
   server_name yourdomainname.com;

        location / {
        if ($request_method = 'GET') {
         add_header 'Access-Control-Allow-Origin' '*';
         add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
         add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
         add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
      }

             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header Host $http_host;
             proxy_set_header X-NginX-Proxy true;

             proxy_pass http://yourdomainname.com/;
             proxy_redirect off;
        }
 }

##Background
---

This Smart Contract implements the idea of a LendingClub which is used as a microfinancing tool
to allow for investment between participants.
Each Week/Month/Year each participant pays an equal amount to the smart contract. Once it has received all the funds it will figure out randomly who the winner of the current round is and payout the deposited funds to the winner.
The main idea is to solve the trust problem of giving one party
or bank the necessary funds. Of cause the problem of a participant not paying after he won remains,
but the contract is minimizing the risk for everyone.
In a broad sense it can be regarded as a lottery where each participant gets paid exactly one time allowing everyone
to make make investments no cash or banks required.

One Real World Implementation can be seen in this [Documentary](https://movies123.watch/movie/living-on-one-dollar-2013.65512) at min 34:00, they are calling it Spending club



## Additional Features
---


- [x] add Safe Math libary for avoiding overflows
- [x] add option for each participant to withdraw their funds
- [ ] optimize Solidity code for reducing gas costs
- [ ] implement multi sig so that it requires consensus of 2/3 of participants for payout
- [ ] write better Tests
- [ ] use react and webpack for managing state and sessions correctly
