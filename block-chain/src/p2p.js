const WebSockets = require('ws'),
    Blockchain = require("./blockchain");
// import WebSockets from "ws";

//마지막 블럭 가져오기
const {getNewestBlock,isBlockStructureValid,replaceChain,addBlockToChain,getBlockChain} = Blockchain;

const sockets = [];

//메시지에 따른 행동 설정
const GET_LASTEST = "GET_LASTEST";
const GET_ALL = "GET_ALL";  //전체 데이터
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";
// 온경우 데이터 형식
const getLatest = () => {
    return{
        type : GET_LASTEST,
        data : null
    };
};

const getAll = () =>{
    return {
        type: GET_ALL,
        data : null
    };
};

const blockchainResponse = data => {
    return {
        type : BLOCKCHAIN_RESPONSE,
        data
    };
};


//서버 최초 시작시 
const startP2PServer = server => {
    const weServer = new WebSockets.Server({server});
    weServer.on("connection", ws =>{
        // connection 된경우 socket 삽입
        initSocketConnection(ws);
        // console.log(`hellow ${ws}`);
    });
    console.log("server running");
};

// 소켓 연결 
const initSocketConnection = ws => {
    sockets.push(ws);
    //들어온 데이터에 따라 socket 작동
    handleSocketMessage(ws);
    // 에러 체크
    handleSocketError(ws);
    sendMessage(ws,getLatest());
    //socket 잘가는지 테스트 
    // socket.on("message", data =>{
    //     console.log(data);
    // });

    // //5초 후에 한번 실행 - 함수 지연 실행
    // setTimeout(() =>{
    //     socket.send("welcome");
    // },3000);
};

//소켓을 받아서 보내는 작업 
const handleSocketMessage = ws =>{
    ws.on("message",data =>{
        //데이터 검증
        const message = parseData(data);
        if (message === null){
            return;
        }
        console.log(message);
        switch(message.type){
            case GET_LASTEST:
                sendMessage(ws,responseLatest());
                break;
            case GET_ALL:
                sendMessage(ws,responseAll());
                break;
            case BLOCKCHAIN_RESPONSE:
                const receiveBlocks = message.data;
                if(receiveBlocks === null){
                    break;
                }
                //block 
                handleBlockchainResponse(receiveBlocks);
                break;
        }
    });
};

//소켓 에러 상황을위한 핸들링
const handleSocketError = ws => {
    const closeSocketConnection = ws =>{
        // 소켓 close
        ws.close();
        // sockets.indexOf(Ws) 부터 1개 삭제
        sockets.splice(sockets.indexOf(ws),1);
    } 
    ws.on("close",() => closeSocketConnection(ws));
    ws.on("error",() => closeSocketConnection(ws));
};

// connect 가 온경우 - 외부에서 접속 요청시
const connectToPeers = newPeer => {
    //웹 소켓 생성
    const ws = new WebSockets(newPeer);
    ws.on('open',() =>{
        initSocketConnection(ws);
    });
}

//JSON parsing
const parseData = data =>{
    try{
        return JSON.parse(data);
    }catch(e){
        console.log(e);
        return null;
    }
}

//JSON parsing message send
const sendMessage = (ws,message) => ws.send(JSON.stringify(message));


// 형식에 따른 응답  
//자기자신의 마지막 블럭
const responseLatest = () => blockchainResponse([getNewestBlock()]);

const sendMessageToAll = message => sockets.forEach(ws => sendMessage(ws,message));

//받은 블럭의 마지막 블럭
const handleBlockchainResponse = receivedBlocks =>{
    if(receivedBlocks.length === 0){
        console.log("handleBlockchainResponse - length size is 0")
        return;
    }
    
    const lastBlockRecevied = receivedBlocks[receivedBlocks.length -1];
    if(!isBlockStructureValid(lastBlockRecevied)){
        console.log("handleBlockchainResponse -isBlockStructureValid error ")
        return;
    }

    const newsblock = getNewestBlock();
    if (lastBlockRecevied.index > newsblock.index){
        // hash 가 하나만 추가되어 온경우 마지막 값만 확인
        if(newsblock.hash === lastBlockRecevied.preHash){
            if(addBlockToChain(lastBlockRecevied)){
                broadcastNewBlock();
            }
        }else if(receivedBlocks.length === 1){
            sendMessageToAll(getAll());
        }else{
            replaceChain(receivedBlocks);
        }
    }
};

const responseAll = () => blockchainResponse(getBlockChain());

const broadcastNewBlock = () => sendMessageToAll(responseLatest());

module.exports = {
    startP2PServer,
    connectToPeers,
    broadcastNewBlock
};