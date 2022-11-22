import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/SideBar.scss";

import { faCopy, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   countState,
// } from "./atom";
import { useNavigate, Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loadingState, ownerState, voteModalState } from "./atom";
import Spinner from "./spinner/Spinner";
import axios from "axios";
import Swal from "sweetalert2";
import icon from "../images/icon.png";
const SideBar = () => {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useRecoilState(ownerState);
  const [isLoading, setLoading] = useRecoilState(loadingState);
  const [modal, setModal] = useRecoilState(voteModalState);

  const result = async (res, text) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-center",
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
  const claim = async () => {
    try {
      setModal(false);
      const { value: ipfsKey } = await Swal.fire({
        title: "참여하신 조합의 비밀번호를 입력하세요",
        input: "text",
      });
      if (ipfsKey) {
        setLoading(true);
        const { data } = await axios.post(
          `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/claim`,
          {
            ipfsKey,
            account: window.klaytn.selectedAddress,
          }
        );

        if (data.data) {
          return result("success", "SUCCESS Claim");
        } else {
          return result("error", "WTF ERROR");
        }
      }
    } catch (e) {
      return result("error", "WTF ERROR");
    }
  };

  //* clipboard에 복사

  return (
    <div className="sideBar">
      <Link to="/">
        <div className="sideBar__Btn">
          <img src={icon} width={70} height={70}></img>
        </div>
      </Link>
      <div className="sideBar__Btn margin" onClick={claim}>
        <p>조합원 </p>
        <p>확인</p>
      </div>

      {isOwner ? (
        <div
          className="sideBar__Btn margin"
          onClick={() => {
            navigate("/setUp");
          }}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </div>
      ) : null}
    </div>
  );
};

export default SideBar;
