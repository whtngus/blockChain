//yarn add body-parser express morgan 설치
//yarn add nodemon
const express = require("express"),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    BlockChain = require("./blockchain");

//사용가능 메소드 불러오기
const {getBlockChain,createNewBlock} = BlockChain;

const PORT = 3000;

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

app.listen(PORT,() => console.log(`Server running on ${PORT}`));