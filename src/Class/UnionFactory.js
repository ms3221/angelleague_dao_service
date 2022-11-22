import Caver from "caver-js";
const caver = new Caver(window.klaytn);

class UnionFactory {
  static instance;
  CA;
  klaytn;
  constructor() {
    if (instance) return instance;
    this.abi = abi;
    this.contractAddress = contractAddress;
    this.klaytn = window.klaytn;
    this.CA = new caver.klay.Contract(abi, contractAddress);
    instance = this;
  }

  async createUnion(subject, contractAddress) {
    //await this.isSelectedAddress();

    const address = this.klaytn.selectedAddress;
    try {
      const res = await caver.klay.sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: address,
        to: contractAddress,
        gas: "8000000",
        data: this.CA.methods.createUnion(subject).encodeABI(),
      });
      if (res) {
        return res;
      }
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  async getTotalUnionName() {
    return await this.CA.methods.getTotalUnionName().call();
  }

  async getTotalUnion() {
    const totalUnionName = await this.CA.methods.getTotalUnionName().call();

    const contractArr = [];
    for (let i = 0; i < totalUnionName.length; i++) {
      const CA = await this.CA.methods
        .getCAddress(totalUnionName[i])
        .call({ from: process.env.REACT_APP_OWNER });
      contractArr.push({ unionName: totalUnionName[i], contractAddress: CA });
    }

    return contractArr;
  }
}

export default UnionFactory;
