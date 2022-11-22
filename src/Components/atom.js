import { atom } from "recoil";
import Caver from "caver-js";
import UnionFactoryABI from "./UnionFactoryABI";
let klay = window.klaytn;
let account = undefined;
const caver = new Caver(klay);

const UnionFactory = new caver.klay.Contract(
  UnionFactoryABI,
  "0xE50dC7e2335896A6b05430BcE031c269eb3E2805"
);

let voteModalState = atom({
  key: "voteModal",
  default: false,
});

let voteValueState = atom({
  key: "voteValue",
  default: null,
});

let ownerState = atom({
  key: "owner",
  default: null,
});

let accountState = atom({
  key: "account",
  default: account,
});

let loadingState = atom({
  key: "loading",
  default: false,
});

export {
  voteModalState,
  voteValueState,
  ownerState,
  accountState,
  loadingState,
};
