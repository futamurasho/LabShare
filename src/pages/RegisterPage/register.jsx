import { useState } from "react";
import { useUser, useDispatchUser } from "../../contexts/UserContext";
import userApi from "../../api/user";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { IoMdArrowRoundBack } from "react-icons/io";

const Register = () => {
  const [enteredData, setEnteredData] = useState({
    username: "",
    email: "",
    password: "",
    year: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const dispatch = useDispatchUser();
  const navigate = useNavigate();

  // 入力変更ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnteredData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleConsentChange = (e) => {
    setConsent(e.target.checked); // チェックボックスの変更を管理
  };

  const SubmitRegister = (e) => {
    e.preventDefault();
    if (!consent) {
      setErrorMessage("登録するには、情報利用についての同意が必要です。");
      return;
    }
    userApi
      .register(enteredData)
      .then((userInfo) => {
        if (userInfo) {
          dispatch({ type: "user/register", state: userInfo });
          setErrorMessage(""); //
          navigate(-1); //前のページに遷移
        } else {
          setErrorMessage("登録に失敗しました。");
        }
      })
      .catch((error) => {
        console.error("ログインエラー:", error);
        setErrorMessage(error || "登録に失敗しました。");
      });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack style={{ fontSize: "3em" }} />
        </button>
        <h1>新規登録</h1>
        <form onSubmit={SubmitRegister}>
          <div className="register-input-group">
            <label htmlFor="username">ユーザ名</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="ユーザ名"
              value={enteredData.username}
              onChange={handleChange}
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="year">学年</label>
            <input
              id="year"
              type="Number"
              name="year"
              placeholder="学年(半角数字のみ)"
              value={enteredData.year}
              onChange={handleChange}
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="メールアドレス"
              value={enteredData.email}
              onChange={handleChange}
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="パスワード"
              value={enteredData.password}
              onChange={handleChange}
            />
          </div>

          <div className="consent-group">
            <p>研究室の研究に必要な情報として提供することに同意します。</p>
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={handleConsentChange}
            />
          </div>

          <button type="submit" className="registerButton">
            登録
          </button>
        </form>
        {errorMessage && <p className="errorms_register">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Register;
