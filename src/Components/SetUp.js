import React, { useEffect, useState } from "react";

import "../styles/SetUp.scss";
import { useNavigate } from "react-router-dom";
import UnionFactoryABI from "./UnionFactoryABI";
import Contract from "../Class/Contract";
import dotenv from "dotenv";
import axios from "axios";
import { useRecoilState, useResetRecoilState } from "recoil";
import { loadingState } from "./atom";
import Spinner from "./spinner/Spinner";
import Swal from "sweetalert2";
dotenv.config({ path: "../.env", encoding: "utf8" });

const SetUp = () => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useRecoilState(loadingState);
  const [provider, setProvider] = useState(window.klaytn);
  const [unionName, setUnionName] = useState(null);
  const [unionNameList, setUnionNameList] = useState([]);
  const unionFactory = new Contract(
    UnionFactoryABI,
    process.env.REACT_APP_UNION_FACTORY
  );

  const createUnion = async () => {
    try {
      console.log(unionName);
      const { data } = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/duplicatePartnership/` +
          unionName
      );

      if (data.data === false) return alert("이미 조합이 만들어져있습니다.");

      if (data.data) {
        setLoading(true);
        const result = await unionFactory.createUnion(
          unionName,
          process.env.REACT_APP_UNION_FACTORY
        );

        if (result) {
          const contractAddress = await unionFactory.getContractAddress(
            unionName,
            provider.selectedAddress
          );

          const dbResult = await axios.post(
            `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/contract`,
            {
              unionName,
              contractAddress,
              blockData: result,
            }
          );
          setLoading(false);
          return navigate("/");
        }
        setLoading(false);
        return Swal.fire({
          title: "Error",
          icon: "error",
        });
      }
    } catch (e) {
      setLoading(false);
      return Swal.fire({
        title: "Error",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    async function dataSet() {
      const { data } = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO`
      );

      setUnionNameList(data.data);
    }

    dataSet();
  }, []);

  return (
    <div className="setUp">
      <div className="setUp__container">
        <div className="unionTextBox">
          <h1>조합 만들기</h1>
        </div>
        <div className="unionMakeBox">
          <label for="unionName">Write Union Name</label>
          <input size={100} value={unionName} readOnly />
        </div>
        <div className="unionMakeBox">
          <select
            onChange={(e) => {
              setUnionName(e.target.value);
            }}
          >
            {unionNameList.map((el) => {
              return (
                <>
                  <option value={el.partnership_name}>
                    {el.partnership_name}
                  </option>
                </>
              );
            })}

            {/* <optgroup label="그외) 음료">
              <option value="사이다">사이다</option>
              <option value="콜라">콜라</option>
            </optgroup> */}
          </select>
        </div>
        <div className="createUnion" onClick={createUnion}>
          create union
        </div>
      </div>
      {isLoading ? <Spinner /> : null}
    </div>
  );
};

export default SetUp;
