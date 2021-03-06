//yarn add body-parser express morgan 설치
//yarn add nodemon
const express = require("express"),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    BlockChain = require("./blockchain"),
    p2p = require("./p2p");

//사용가능 메소드 불러오기
const {getBlockChain,createNewBlock} = BlockChain;

// import는 p2p 파일 전체 export인경우에만 사용 가능
// import {startP2PServer} from "./p2p";
const {startP2PServer,connectToPeers} = p2p;

const PORT = process.env.HTTP_PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));


// router  block 보기 
app.get("/blocks",(req,res) =>{
    //render 
    res.send(getBlockChain());
});

// requset의 body의 데이터를 가져옴
app.post("/blocks",(req,res) =>{
    const {body : {data} } = req;
    const newBlock = createNewBlock(data);
    res.send(newBlock);
});



app.post("/peers",(req,res) => {
    const { body : {peer}} = req;
    connectToPeers(peer);
    res.send();
});

const server = app.listen(PORT,() => console.log(`Server running on ${PORT}`));
//생성된 소켓 전달
startP2PServer(server);