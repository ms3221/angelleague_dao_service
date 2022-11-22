import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Gate.scss";
import "../styles/reset.scss";
import axios from "axios";
// atom.js
import KeyringController from "eth-keyring-controller";
import SimpleKeyring from "eth-simple-keyring";
import { encrypt, decrypt } from "encryptor-node";
import {
  pwdState,
  testState,
  keyringControrllerState,
  keyringState,
} from "./atom";
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
} from "recoil";
const Gate = () => {


  const [keyringController, setKeyringController] = useRecoilState(
    keyringControrllerState
  );
  const [keyring, setKeyring] = useRecoilState(keyringState);
  const [pwd, setPwd] = useRecoilState(pwdState);
  // const currentPwd = useRecoilValue(pwdState);  // 읽기 전용!
  // const currentTest = useRecoilValue(testState);  // 읽기 전용!
  const [tab, setTab] = useState("생성");
  const [니모닉, setMnemonic] = useState(null);
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState(null);

  const createMnemonic = async () => {
    setTab("복구");
    //  const {data} = await axios.get('http://localhost:8888/createMnemonic');
    setMnemonic(
      "copy sister motion amused cushion thumb fall vibrant gather sniff transfer valid"
    );
  };

  const createWallet = async () => {
    // console.log(니모닉.lengtho,pwd);
    
    const keyringcontroller = keyringController();
    const result = await keyringcontroller.createNewVaultAndRestore(
      pwd,
      니모닉
    );

    setKeyring(keyringcontroller);

    // if(니모닉 !== null){

    //  const {data} = await axios.post('http://localhost:8888/createWallet',{
    //    pwd:'1234',
    //    mnemonic:'copy sister motion amused cushion thumb fall vibrant gather sniff transfer valid'
    //  });

    //  if(data.firstAccount){

    //    localStorage.setItem('valutData',JSON.stringify(data.vaultData));
    //    localStorage.setItem('currentAddress',data.firstAccount);

    //    return
    //  }
    // }else{
    //   alert('wallet을 생성시켜주세요')

    // }
  };

  return (
    <div className="frame gate">
      <div className="tab">
        <div class={tab} onClick={() => setTab("생성")}>
          생성
        </div>
        <div class={tab} onClick={() => createMnemonic()}>
          복구
        </div>
      </div>

      {tab === "생성" && (
        <>
          <div className="tab-container">
            <div>
              <p>계정 이름은 나에게만 보여집니다</p>
              <form>
                <div>
                  <label htmlFor="nickName">계정 이름 입력</label>
                  <input id="nickName" type="text" placeholder="계정 1" />
                </div>
              </form>
            </div>
            <Link to="/home">
              <button className="btn">생성</button>
            </Link>
          </div>
        </>
      )}
      {tab === "복구" && (
        <>
          <div className="tab-container">
            <div>
              <p>
                시드 구문을 입력하여 계정을 복구할 수 있습니다. 각 단어는 공백
                한 칸으로 분리되어야 합니다.
              </p>
              <form>
                <div>
                  <label htmlFor="seed">시드 구문 입력</label>
                  <textarea
                    id="seed"
                    placeholder="시드 구문을 붙여넣으세요."
                    value={니모닉}
                  ></textarea>
                </div>
              </form>
            </div>
            <Link to="/home">
              <button className="btn" onClick={createWallet}>
                복구
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Gate;
