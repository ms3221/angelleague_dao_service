import Caver from "caver-js";
const caver = new Caver(window.klaytn);
class Contract {
  CA;
  klaytn;
  constructor(abi, contractAddress) {
    this.abi = abi;
    this.contractAddress = contractAddress;
    this.klaytn = window.klaytn;
    this.CA = new caver.klay.Contract(abi, contractAddress);
  }

  async isSelectedAddress() {
    if (this.klaytn.selectedAddress === undefined) {
      this.klaytn.enable();
    }
    return;
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
      return false;
    }
  }

  async vote(suggestionName, answer, tokenId, contractAddress) {
    const address = this.klaytn.selectedAddress;

    try {
      const res = await caver.klay.sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: address,
        to: contractAddress,
        gas: 800000,
        data: this.CA.methods.vote(suggestionName, answer, tokenId).encodeABI(),
      });
      if (res) {
        return 1;
      }
    } catch (e) {
      return -1;
    }
  }

  async createSuggestion(subject, contractAddress) {
    const address = this.klaytn.selectedAddress;
    try {
      const res = await caver.klay.sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: address,
        to: contractAddress,
        gas: "5000000",
        data: this.CA.methods.createOneSuggestion(subject).encodeABI(),
      });
      if (res) {
        return 1;
      }
    } catch (e) {
      return -1;
    }
  }

  async suggestionNum(suggestionName = "") {
    return await this.CA.methods.findSuggestionNo(suggestionName).call();
  }

  async getSuggestionInfo(suggestionName = "") {
    const { timestamp } = await caver.klay.getBlock("latest");
    const num = await this.CA.methods
      .findSuggestionNo(suggestionName)
      .call({ from: process.env.REACT_APP_OWNER });
    const { subject, suggestionNo, totalAmount, startAt, expireAt } =
      await this.CA.methods
        .getSuggestionInfo(num)
        .call({ from: process.env.REACT_APP_OWNER });
    return {
      subject,
      suggestionNo,
      totalAmount,
      timestamp: caver.utils.hexToNumberString(timestamp),
      expireAt,
    };
  }

  //*
  async getTotalUnionName() {
    return await this.CA.methods.getTotalUnionName().call();
  }

  async getTotalUnionContractAddress(totalUnionName, owner) {
    const contractArr = [];

    if (owner) {
      for (let i = 0; i < totalUnionName.length; i++) {
        const CA = await this.CA.methods
          .getCAddress(totalUnionName[i].name)
          .call({ from: process.env.REACT_APP_OWNER });
        contractArr.push({
          unionName: totalUnionName[i].name,
          contractAddress: CA,
          image: totalUnionName[i].collection_image_url,
        });
      }
    } else {
      for (let i = 0; i < totalUnionName.length; i++) {
        const CA = await this.CA.methods
          .getCAddress(totalUnionName[i].asset_name)
          .call({ from: process.env.REACT_APP_OWNER });
        contractArr.push({
          unionName: totalUnionName[i].asset_name,
          contractAddress: CA,
          image: totalUnionName[i].background_image_url,
        });
      }
    }

    return contractArr;
  }

  async getContractAddress(unionName, currentAccount) {
    const totalUnionName = await this.CA.methods
      .getCAddress(unionName)
      .call({ from: currentAccount });
    return totalUnionName;
  }

  async getVoterInfo(suggestionName = "") {
    const num = await this.CA.methods.findSuggestionNo(suggestionName).call();
    const { unionMember } = await this.CA.methods
      .getSuggestionInfo(num)
      .call({ from: process.env.REACT_APP_OWNER });

    /*
      받아오는데이터를 찬성과 반대 등 결정된것들로 정제해서 나가보자.
      필요한 데이터 총양 / yes에 투표한 양 / NO에 투표한 양  / 투표한 결과내역이 담겨있는 rawDATA"(주소 / 답변 / 양 )
      */

    let allData = [];
    let yesAnswer = { amount: 0 };
    let noAnswer = { amount: 0 };
    let giveUpAnswer = { amount: 0 };

    for (let i = 0; i < unionMember.length; i++) {
      const { addr, answer, power } = unionMember[i];
      if (answer === "찬성") {
        yesAnswer.amount += Number(power);
        allData.push({ addr, answer, power });
      } else if (answer === "반대") {
        noAnswer.amount += Number(power);
        allData.push({ addr, answer, power });
      } else if (answer === "기권") {
        giveUpAnswer.amount += Number(power);
        allData.push({ addr, answer, power });
      }
    }

    const calPer = await this.calVoteResult(
      Number(yesAnswer.amount),
      Number(noAnswer.amount),
      Number(giveUpAnswer.amount)
    );

    return {
      yesData: yesAnswer,
      noData: noAnswer,
      giveUpData: giveUpAnswer,
      allData,
      ...calPer,
    };
  }

  //투표율 계산해 주는 함수
  async calVoteResult(yes, no, giveUp) {
    if (yes === 0 && no === 0 && giveUp)
      return { yesPer: 0, noPer: 0, giveUpPer: 0 };

    const total = yes + no + giveUp;
    const yesPer = yes !== 0 ? ((yes / total) * 100).toFixed(0) : 0;
    const noPer = no !== 0 ? ((no / total) * 100).toFixed(0) : 0;
    const giveUpPer = giveUp !== 0 ? ((giveUp / total) * 100).toFixed(0) : 0;
    return { yesPer, noPer, giveUpPer };
  }

  async getSuggestions() {
    const subjects = [];
    const data = await this.CA.methods.getSubjects().call();

    for (let i = 0; i < data.length; i++) {
      const { subject, startAt, expireAt } = await this.CA.methods
        .suggestions(i)
        .call();
      let status = false;

      const { timestamp } = await caver.klay.getBlock("latest");
      //1660723652
      //new Date(1660723652 * 1000);
      // console.log(new Date(timestamp * 1000).toString());
      if (caver.utils.hexToNumberString(timestamp) < expireAt) {
        status = true;
      }

      subjects.push({
        subject,
        status,
        date: `${new Date(expireAt * 1000).getFullYear()}-${
          new Date(expireAt * 1000).getMonth() + 1
        }-${new Date(expireAt * 1000).getDate()} `,
      });
    }
    return subjects;
  }

  async roleCheck(currentAddress) {
    const bool = await this.CA.methods.isOwner(currentAddress).call();

    return bool;
  }

  async tokenIdCheck(tokens, suggestionName) {
    const suggestionNo = await this.CA.methods
      .findSuggestionNo(suggestionName)
      .call();

    const result = [];
    for (let i = 0; i < tokens.length; i++) {
      const res = await this.CA.methods
        .isVote(suggestionNo, Number(tokens[i].token_id))
        .call();
      if (!res) {
        const power = await this.CA.methods
          .votePower(Number(tokens[i].token_id))
          .call();

        result.push({
          tokenId: Number(tokens[i].token_id),
          power,
          imgUrl: tokens[i].asset_image_url,
        });
      }
    }
    return result;
  }
}

export default Contract;
