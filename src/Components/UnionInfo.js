import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/unionInfo.scss";
import { useNavigate } from "react-router-dom";
import Contract from "../Class/Contract";
import UnionABI from "./UnionABI";
import { accountState, loadingState, ownerState } from "./atom";
import { useRecoilState } from "recoil";
import axios from "axios";
import Swal from "sweetalert2";
import styled from "styled-components";

const ProcessDiv = styled.div`
  color: white;
  width: 200px;
  height: 34px;
  padding: 8px;
  margin: 5px;
  font-size: 18px;
  font-weight: bold;
  background: ${(props) => props.color};
  border-radius: 20px;
  text-align: center;
  transition: all 0.1s ease-in;
`;
const UnionInfo = () => {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useRecoilState(ownerState);
  const [currentAccount, setCurrentAccount] = useRecoilState(accountState);
  const [isUserSetting, setIsUserSetting] = useState(true);
  const [isLoading, setLoading] = useRecoilState(loadingState);
  let { unionName, contractAddress } = useParams();
  const unionCA = new Contract(UnionABI, contractAddress);

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    async function totalSubject() {
      const data = await unionCA.getSuggestions();
      setSuggestions(data);
    }

    totalSubject();
  }, [currentAccount]);

  const result = async (res, text) => {
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
    setLoading(false);
    return Toast.fire({
      icon: res,
      title: text,
    });
  };

  async function userSetting() {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/userSetting`,
        {
          partnershipName: unionName,
        }
      );

      if (data.data) {
        return result("success", "userSetting SUCCESS");
      } else {
        setLoading(false);
        return result("error", "userSetting fail");
      }
    } catch (e) {
      return result("error", "WTF ERROR");
    }
  }

  return (
    <div className="unionBox">
      <div className="unionBox__container">
        <div className="unionInfoBox">
          {/* <div className="unionInfoSideBar">
            <div className="unionName">{unionName}</div>
            <div>
              <span>투표 안건</span>
            </div>
            <div>상세 내용</div>
            {isOwner && isUserSetting && (
              <div
                onClick={() => {
                  navigate(`/create/suggestion/${contractAddress}`);
                }}
                className="newSuggestion"
              >
                새로운 제안 만들기
              </div>
            )}

            {isOwner && isUserSetting && (
              <div onClick={userSetting} className="userSetting">
                userSetting
              </div>
            )}
          </div> */}
          <div className="unionSuggestions">
            <div className="unionInfoSideBar">
              <div className="unionName">{unionName}</div>
              {isOwner && isUserSetting && (
                <div
                  onClick={() => {
                    navigate(`/create/suggestion/${contractAddress}`);
                  }}
                  className="newSuggestion"
                >
                  새로운 제안 만들기
                </div>
              )}
            </div>

            {isOwner && isUserSetting && (
              <div onClick={userSetting} className="userSetting">
                userSetting
              </div>
            )}
            <div className="suggestion_text">
              <h1>조합 총회 투표 안건</h1>
            </div>
            {suggestions.length === 0 ? (
              <div className="suggestionEmpty">
                <div>
                  <h1>만들어진 제안이 없습니다.</h1>
                </div>
                {isOwner ? (
                  <div
                    className="button"
                    onClick={() => {
                      navigate(`/create/suggestion/${contractAddress}`);
                    }}
                  >
                    제안생성
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                {suggestions.map((el) => {
                  return (
                    <>
                      <div
                        className="suggestion"
                        onClick={() => {
                          navigate(
                            `/suggestion/${unionName}/${el.subject}/${contractAddress}`
                          );
                        }}
                      >
                        <ProcessDiv
                          color={el.status === true ? "#4360EC;" : "red"}
                        >
                          {el.status === true
                            ? `종료일 : ${el.date}`
                            : `종료일 : ${el.date}`}
                        </ProcessDiv>
                        <p>{el.subject}</p>
                      </div>
                    </>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnionInfo;
