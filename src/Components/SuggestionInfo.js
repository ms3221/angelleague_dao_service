import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/SuggestionInfo.scss";

import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Contract from "../Class/Contract";
import UnionABI from "./UnionABI";
import VoteModal from "./Modal/Vote_modal";
import { useRecoilState } from "recoil";
import { accountState, voteModalState, voteValueState } from "./atom";
import styled from "styled-components";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import markDown from "../common/description";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";

const MarkDownStyle = styled.div`
  font-size: 1rem;
  line-hight: 2.5rem;
`;

const Bar = styled.div`
  width: ${(props) => props.per || 0}%;
  height: 10px;
  margin-right: 10px;
  border-radius: 50px;
  background-color: #4360ec;
  transition: all 0.5s ease-in;
`;

const SuggestionInfo = () => {
  const navigate = useNavigate();
  const { unionName, suggestionName, contractAddress } = useParams();
  const unionCA = new Contract(UnionABI, contractAddress);
  const [currentAccount, setCurrentAccount] = useRecoilState(accountState);
  const [suggestionInfo, setSuggestionInfo] = useState({});
  const [votePer, setVotePer] = useState({ yesPer: 0, noPer: 0, giveUpPer: 0 });
  const [modalData, setModalData] = useState(null);
  const [voter, setVoter] = useState({
    yesAmount: 0,
    noAmount: 0,
    giveUpAmount: 0,
    voterList: [],
  });
  const [check, setCheck] = useState({
    A: "voteButton",
    B: "voteButton",
    C: "voteButton",
    vote: "vote_none",
  });
  const [answer, setAnswer] = useState(null);
  const [modal, setModal] = useRecoilState(voteModalState);
  const [voteValue, setVoteValue] = useRecoilState(voteValueState);
  const [markdown, setMarkDown] = useState();

  async function dataSet() {
    const suggestionData = await unionCA.getSuggestionInfo(suggestionName);

    const voterData = await unionCA.getVoterInfo(suggestionName);

    setSuggestionInfo(suggestionData);
    setVoter({
      yesAmount: voterData.yesData.amount,
      noAmount: voterData.noData.amount,
      giveUpAmount: voterData.giveUpData.amount,
      voterList: voterData.allData,
    });

    setVotePer({
      yesPer: voterData.yesPer,
      noPer: voterData.noPer,
      giveUpPer: voterData.giveUpPer,
    });
  }
  async function setData() {
    const { data } = await axios.get(
      `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/getToken/${window.klaytn.selectedAddress}/${unionName}`
    );
    const datas = await unionCA.tokenIdCheck(data.data, suggestionName);

    setModalData(datas);
  }
  useEffect(() => {
    setData();
    dataSet();
    setMarkDown(markDown);
  }, []);

  const changeClassName = (answer) => {
    if (answer === "찬성") {
      setVoteValue([suggestionName, answer, contractAddress]);
      return setCheck({
        A: "voteButton_check",
        B: "voteButton",
        C: "voteButton",
        vote: "vote_check",
      });
    } else if (answer === "반대") {
      setVoteValue([suggestionName, answer, contractAddress]);
      return setCheck({
        A: "voteButton",
        B: "voteButton_check",
        C: "voteButton",
        vote: "vote_check",
      });
    } else if (answer === "기권") {
      setVoteValue([suggestionName, answer, contractAddress]);
      return setCheck({
        A: "voteButton",
        B: "voteButton",
        C: "voteButton_check",
        vote: "vote_check",
      });
    }
  };

  function modalCheck() {
    if (check.vote === "vote_none") return;
    setModal(!modal);
  }
  function test(a) {
    setData();
    dataSet();
  }
  return (
    <div className="suggestionInfoMain">
      <div className="suggestionInfoBox">
        <div className="backIcon">
          <span
            onClick={() => {
              navigate(-1);
            }}
          >
            <FontAwesomeIcon icon={faAnglesLeft} /> 뒤로
          </span>
        </div>
        <div className="flex">
          <div className="suggestionInfo">
            <div className="suggestionName">{suggestionInfo.subject}</div>
            <div className="suggestionContent">
              <MarkDownStyle>
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </MarkDownStyle>
            </div>
            {suggestionInfo.timestamp < suggestionInfo.expireAt ? (
              <div className="voteBox">
                <div className="voteText">
                  <h1>조합 총회 투표 하기</h1>
                </div>
                <div
                  className={`yes_${check.A}`}
                  onClick={() => {
                    changeClassName("찬성");
                  }}
                >
                  찬성
                </div>
                <div
                  className={`no_${check.B}`}
                  onClick={() => {
                    changeClassName("반대");
                  }}
                >
                  반대
                </div>
                <div
                  className={`giveUp_${check.C}`}
                  onClick={() => {
                    changeClassName("기권");
                  }}
                >
                  기권
                </div>
                <div className={check.vote} onClick={modalCheck}>
                  투표
                </div>
              </div>
            ) : null}
            <div className="voterList">
              <div className="voter_result_head">투표 현황</div>
              <div className="voter_result_content">
                {voter.voterList.map((el) => {
                  return (
                    <>
                      <div className="voter">
                        <span className="address">{el.addr.toLowerCase()}</span>
                        <span className="answer">{el.answer}</span>
                        <span className="power">{el.power}</span>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
            <div className="sideBox_info">
              <div className="informationBox_info">
                <div className="informationBox_info_header">현재결과</div>
                <div className="informationBox_info_content">
                  <div className="BarText">
                    <div>찬성</div>
                    <div>{votePer.yesPer}%</div>
                  </div>
                  <div className="firstBarParent">
                    <Bar per={votePer.yesPer} />
                  </div>
                  <div className="BarText">
                    <div>반대</div>
                    <div>{votePer.noPer}%</div>
                  </div>
                  <div className="firstBarParent">
                    <Bar per={votePer.noPer} />
                  </div>
                  <div className="BarText">
                    <div>기권</div>
                    <div>{votePer.giveUpPer}%</div>
                  </div>
                  <div className="firstBarParent">
                    <Bar per={votePer.giveUpPer} />
                  </div>
                  {/* <p> Yes : {voter.yesAmount} DAOs</p>
                <p> No : {voter.noAmount} DAOs</p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal ? (
        <VoteModal unionCA={unionCA} datas={modalData} test={test} />
      ) : null}
    </div>
  );
};

export default SuggestionInfo;
