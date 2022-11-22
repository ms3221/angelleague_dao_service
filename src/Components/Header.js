import React, { useEffect, useRef, useState } from "react";

import "../styles/Header.scss";
import "../styles/reset.scss";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UnionFactoryABI from "./UnionFactoryABI";
import Contract from "../Class/Contract";
import { useRecoilState } from "recoil";
import { accountState, ownerState } from "./atom";
import Swal from "sweetalert2";
import logo from "../images/angelLogo.png";

const Header = () => {
  const alertSwal = async (res, text) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "center-center",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: res,
      title: text,
    });
    return;
  };

  const [klaytn, setKlaytn] = useState(null);
  const [currentAccount, setCurrentAccount] = useRecoilState(accountState);

  const [isOwner, setIsOwner] = useRecoilState(ownerState);
  const copyLinkRef = useRef();

  let unionFactory = new Contract(
    UnionFactoryABI,
    process.env.REACT_APP_UNION_FACTORY
  );

  useEffect(() => {
    if (typeof window.klaytn === "undefined") {
      alertSwal("error", "카이카이스 지갑을 download해주세요!");
    } else if (window.klaytn.networkVersion !== 1001) {
      alertSwal("error", "Baobob network로 변경해주세요");
      return;
    } else if (window.klaytn.selectedAddress === undefined) {
      return;
    } else {
      dataSet();
    }
    async function dataSet() {
      // const accounts = await window.klaytn.enable();
      setIsOwner(await unionFactory.roleCheck(window.klaytn.selectedAddress));
      if (window.klaytn.isConnected() === true) {
        setCurrentAccount(window.klaytn.selectedAddress);
        setKlaytn(window["klaytn"]);
      }

      window.klaytn.on("accountsChanged", function (accounts) {
        setCurrentAccount(accounts[0]);
      });
    }
  }, [currentAccount]);

  const copy = () => {
    copyLinkRef.current.focus();
    copyLinkRef.current.select();
    navigator.clipboard.writeText(copyLinkRef.current.value).then(() => {
      alert("주소를 복사했습니다.");
    });
  };

  const connectWallet = async () => {
    if (typeof window.klaytn === "undefined") {
      return alertSwal("error", "카이카이스 지갑을 download해주세요!");
    } else if (window.klaytn.networkVersion !== 1001) {
      alertSwal("error", "Baobob network로 변경해주세요");
      return;
    }

    try {
      const accounts = await window.klaytn.enable();
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
      return;
    }
  };

  return (
    <div className="header">
      <div className="header__container">
        <div>
          <img src={logo} width={300}></img>
        </div>
        {/* <div className="headerName">조합 투표 시스템</div> */}
        <div className="walletBox" onClick={connectWallet}>
          {currentAccount ? (
            <div onClick={copy}>
              <span className="currentAccount">
                {currentAccount.substring(0, 6) +
                  "..." +
                  currentAccount.slice(-6)}
              </span>
              <FontAwesomeIcon icon={faCopy} />
              <input value={currentAccount} ref={copyLinkRef} hidden />
            </div>
          ) : (
            <div>지갑연결</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
