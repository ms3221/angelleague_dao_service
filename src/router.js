import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Header from "./Components/Header";
import SideBar from "./Components/SiderBar";
import SetUp from "./Components/SetUp";
import "./styles/Home.scss";
import "./styles/reset.scss";
import UnionInfo from "./Components/UnionInfo";
import Suggestion from "./Components/Suggestion";
import SuggestionInfo from "./Components/SuggestionInfo";
import { loadingState } from "./Components/atom";
import { useRecoilState } from "recoil";
import Spinner from "./Components/spinner/Spinner";

const Router = () => {
  const [isLoading, setLoading] = useRecoilState(loadingState);
  return (
    <BrowserRouter>
      <div className="frame">
        <SideBar />
        <div className="mainPage">
          <Header />
          {isLoading && <Spinner />}
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/setUp" element={<SetUp />} />
            <Route
              exact
              path="/unions/:unionName/:contractAddress"
              element={<UnionInfo />}
            />
            <Route
              exact
              path="/create/suggestion/:contractAddress"
              element={<Suggestion />}
            />
            <Route
              exact
              path="suggestion/:unionName/:suggestionName/:contractAddress"
              element={<SuggestionInfo />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default Router;
