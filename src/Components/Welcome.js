import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Welcome.scss";
import { pwdState } from "./atom";
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
} from "recoil";
function Welcome() {
  const [pwd, setPwd] = useState(null);
  const pwdHandler = useSetRecoilState(pwdState); // 값만 변경 시키기
  function checkPwd() {
    pwdHandler(() => pwd);
  }

  return (
    <div className="frame welcome">
      <div className="title">
        <h2>Welcome to Trippy Wallet!</h2>
        <p>계정 접근을 위한 고유 비밀번호를 설정하세요.</p>
      </div>
      <form className="form">
        <div>
          <label htmlFor="pw1">비밀번호 입력</label>
          <input
            id="pw1"
            type="password"
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pw2">비밀번호 확인</label>
          <input id="pw2" type="password" />
        </div>
        <Link to="/gate">
          <button className="btn" onClick={checkPwd}>
            생성
          </button>
        </Link>
      </form>
      <p>
        계속하면 trippy의 이용약관과 개인정보처리방침에 동의한 것으로 간주됩니다
      </p>
    </div>
  );
}

export default Welcome;
