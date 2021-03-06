const CryptoJs = require('crypto-js');
class Block{
    constructor(index,hash, preHash,timestamp,data){
        this.index = index;
        this.hash = hash;
        this.timestamp = timestamp;
        this.preHash = preHash;
        this.data = data;
    }
};

//처음 block는 hash를 직접 만들어야함 SHA256
// 계속 이 block 을 암호화하며 연결
const genesisBlock = new Block(
    0,
    //0,0,0,1533652167117,suhyun 으로 생성한 암호
    "E5F35FB63EF0CF76B9A692DC1365867F462B5DC40599A0FC831B7B370E140EED",  
    null,
    1533652167117, //new Date().getTime() 으로 얻은 정보,
    "suhyun"  // 저장할 데이터 
);

//연속된 블럭이 저장될 변수
let blockChain = [genesisBlock];
//block 가져오기  
const getBlockChain = () => blockChain;

//기존 블럭 생성
// console.log(gesnesisBlock);

// 마지막 blcok 정보 
const getNewestBlock = () => blockChain[blockChain.length-1]; 

// blcok 생성시간 뒤에 365나누기는 sort  
const getTimestamp = () => new Date().getTime(); 

// Hash화 만들기
const createHash = (index, preHash,timestamp,data) =>
    CryptoJs.SHA256(index+preHash+timestamp+JSON.stringify(data)).toString();

//hasn 가져오기 
const getBlockHash = block => createHash(block.index,block.preHash,block.timestamp,block.data);

//새 블럭 생성
const createNewBlock = data => {
    //새로운 block 생성을위해 이전 block 정보를 가져옴 
    const preBlock = getNewestBlock();
    // 새로운 블럭은 index 추가
    const newBlockIndex = preBlock.index+1;
    const newTimestamp = getTimestamp();
    const newHash = createHash(
        newBlockIndex,
        preBlock.hash,
        newTimestamp,
        data
    );
    const newBlock = new Block(
        newBlockIndex,
        newHash,
        preBlock.hash,
        newTimestamp,
        data
    );
    addBlockToChain(newBlock);
    return newBlock;
};


//그전 블럭과 최근 블럭을 비교하여 검증
const isBlockValid = (candidateBlock,lastestBlock) =>{
    //데이터형 검증
    if(!isBlockStructureValid(candidateBlock)) {
        console.log("data structure is not same");
        return false;
    }
    // index 번호 검증
    else if(lastestBlock.index + 1 !== candidateBlock.index) {
        console.log("index value is not currect");
        return false;
    }
    //이전 hash 검증
    else if(lastestBlock.hash !== candidateBlock.preHash){
        console.log("last hash value is not same");
        return false;
    }
    // 지금 hash 검증
    else if(getBlockHash(candidateBlock) !== candidateBlock.hash){
        console.lig("hash value is not currect");
        return false;
    }
    //모든검증 통과
    return true;
};

//블럭에 대한 검증 - 형태만 확인 
const isBlockStructureValid = block =>{
    return(
      typeof block.index === "number" &&
      typeof block.hash === "string" &&
      typeof block.preHash === "string" &&
      typeof block.timestamp === "number" &&
      typeof block.data === "string"
    );
};

//chain길이 검증 
const isChainValid = candidateChain => {
    //최초 block 을 가지고있는지 확인
    const isGenesisValid = block => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if(!isGenesisValid(candidateChain[0])){
        return false;
    }
    //모든 block 확인
    for(let i =1;i<candidateChain.length;i++){
        if(!isBlockValid(candidateChain[i],candidateChain[i-1])){
            return false;
        }
    }
    //  모든 이전 block에대한 검증 확인
    return true;
};

// 지금까지 만들어진 chain 비교후 최신 chain이아닌경우 교체
const replaceChain = candidateChain =>{
    //다른사람의 chain과 비교해서 내가 정보가 부족하면 가져옴 
    if(isChainValid(candidateChain) && candidateChain.length > getBlockChain().length){
        blockChain = candidateChain;
        return true;
    }else{
        return false;
    }
};

// 블럭 검사 후 추가
const addBlockToChain = candidateBlock =>{
    if(isBlockValid(candidateBlock,getNewestBlock())){
        blockChain.push(candidateBlock);
        return true;
    }
    return false;
    
};

// 불러올 수 있는 메소드 명시
module.exports = {
    getBlockChain,
    createNewBlock,
    getNewestBlock,
    isBlockStructureValid,
    addBlockToChain,  //한두개 차이날경우
    replaceChain    //많이 차이날 경우
}