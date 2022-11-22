import React, { useEffect, useState } from "react";

import "../../styles/SuggestionInfo.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { accountState, voteModalState, voteValueState } from "../atom";
import { useParams } from "react-router-dom";
import axios from "axios";

const VoteModal = ({ unionCA, datas, test }) => {
  const [modal, setModal] = useRecoilState(voteModalState);
  let { unionName, suggestionName } = useParams();
  const [voteValue, setVoteValue] = useRecoilState(voteValueState);
  const [tokenIds, setTokenIds] = useState(datas);
  const [power, setPower] = useState("null");
  const [tokenId, setTokenId] = useState("null");
  const [currentAccount, setCurrentAccount] = useRecoilState(accountState);
  const [select, setSelect] = useState(false);

  useEffect(() => {
    document.body.style.cssText = `
    position: fixed; 
    top: -${window.scrollY}px;
    overflow-y: scroll;
    width: 100%;`;
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    };
  }, []);

  const vote = async () => {
    if (tokenId === "null") return alert("투표할 NFT를 선택해주세요");
    const [suggestionName, answer, contractAddress] = voteValue;
    const result = await unionCA.vote(
      suggestionName,
      answer,
      tokenId,
      contractAddress
    );
    if (result > 0) {
      test();
      setModal(!modal);
    } else {
      alert("실패했습니다.");
    }
  };
  const clickItem = (item) => {
    setTokenId(item.tokenId);
    setPower(item.power);
  };

  return (
    <div className="vote_modal">
      <div className="vote_modal_box">
        <div className="vote_modal_header">
          <div className="icon">
            <div
              onClick={() => {
                setModal(!modal);
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
          <div className="modal_text_header">vote overview</div>
        </div>
        {tokenIds.length > 0 && (
          <>
            <div className="vote_modal_NFTs">
              {tokenIds.map((el) => {
                let name = "";
                if (tokenId === el.tokenId) {
                  name = "selected";
                }
                return (
                  <>
                    <div
                      className={`NFT ${name}`}
                      id={el.tokenId}
                      onClick={() => {
                        clickItem(el);
                      }}
                    >
                      <img src={el.imgUrl} style={{ width: "50px" }}></img>
                      <h1>tokenId : {el.tokenId}</h1>
                      <h3>power : {el.power}</h3>
                    </div>
                  </>
                );
              })}
            </div>
          </>
        )}
        {tokenIds.length === 0 && (
          <>
            <div className="votePower_empty">
              <p>투표할 권한이 없습니다</p>
            </div>
          </>
        )}
        <div className="vote_modal_execute">
          {tokenIds.length !== 0 && (
            <>
              <div
                className="vote_modal_button_cancel"
                onClick={() => {
                  setModal(!modal);
                }}
              >
                취소
              </div>
              <div className="vote_modal_button_vote" onClick={vote}>
                투표
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoteModal;
