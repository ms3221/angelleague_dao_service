import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.scss";
import Caver from "caver-js";
import UnionFactoryABI from "./UnionFactoryABI";
import Contract from "../Class/Contract";
import dotenv from "dotenv";
import { useRecoilState } from "recoil";
import { accountState, loadingState } from "./atom";
import Spinner from "./spinner/Spinner";
import axios from "axios";
dotenv.config({ path: "../.env", encoding: "utf8" });

const Home = () => {
  const [caver, setCaver] = useState(new Caver(window.klaytn));
  const [currentAccount, setCurrentAccount] = useRecoilState(accountState);
  const [isLoading, setLoading] = useRecoilState(loadingState);
  let unionFactory = new Contract(
    UnionFactoryABI,
    process.env.REACT_APP_UNION_FACTORY
  );

  const [unionList, setUnionList] = useState([]);

  useEffect(() => {
    async function dataSet() {
      if (currentAccount !== undefined) {
        let owner = await unionFactory.roleCheck(currentAccount);
        let unionNames;

        if (owner) {
          let { data } = await axios.get(
            `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/owner`
          );
          unionNames = data.data;
        } else {
          let { data } = await axios.get(
            `${process.env.REACT_APP_APIENDPOINT}/partnerships/DAO/${currentAccount}`
          );
          unionNames = data.data;
        }
        const dataList = await unionFactory.getTotalUnionContractAddress(
          unionNames,
          owner
        );
        setUnionList(dataList);
      }
    }

    dataSet();
  }, [currentAccount]);

  return (
    <div className="home">
      <div className="home__container">
        <div className="unionsTextBox">
          {unionList.length === 0 ? (
            <h1>참여 조합 현황</h1>
          ) : (
            <h1>참여한 조합</h1>
          )}
        </div>

        {unionList.length === 0 ? (
          <>
            <div className="union">
              <div>
                <p>klaytn 지갑을 연결하시면,</p>
                <p>참여하신 조합의 안건을 확인하고</p>
                <p>투표하실 수 있습니다.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="unionsBox">
              {unionList.map((el) => {
                return (
                  <Link
                    to={`unions/${el.unionName}/${el.contractAddress}`}
                    className="unionParent"
                  >
                    <div className="union">
                      <div>
                        <img src={el.image} style={{ width: "100px" }}></img>
                      </div>
                      <div>
                        <p>{el.unionName}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
      {isLoading ? <Spinner /> : null}
    </div>
  );
};

export default Home;
