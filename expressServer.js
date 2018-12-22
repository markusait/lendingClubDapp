const express = require('express');
const fs = require("fs");

let source = fs.readFileSync('./contracts/LendingClub.sol');


// App setup
const app = express();
const port = 3009


//Middleware
app.use(express.static('./app'));
//serving the smart contracts json
app.use('/content', express.static('./build/contracts'))


//cors

app.use(function (req,res, next){
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

const server = app.listen(port, function(){
  console.log(`listening for requests on port ${port}`)
})
