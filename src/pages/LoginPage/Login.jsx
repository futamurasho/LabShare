import { useState } from "react";
import { useDispatchUser } from "../../contexts/UserContext";
import userApi from "../../api/user";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { IoMdArrowRoundBack } from "react-icons/io";

const Login = () => {
  const [enteredData, setEnteredData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatchUser();
  const navigate = useNavigate();

  // 入力変更ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnteredData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const SubmitLogin = (e) => {
    e.preventDefault();
    userApi
      .login(enteredData)
      .then((userInfo) => {
        if (userInfo) {
          dispatch({ type: "user/login", state: userInfo });
          setErrorMessage(""); //
          navigate(-1); //前のページに遷移
        } else {
          setErrorMessage("ログインに失敗しました。");
        }
      })
      .catch((error) => {
        console.error("ログインエラー:", error);
        setErrorMessage(error || "ログインに失敗しました。");
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack style={{ fontSize: "3em" }} />
        </button>
        <h1>ログインする</h1>
        <div className="uiForm">
          <form onSubmit={SubmitLogin}>
            <div className="input-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="メールアドレス"
                value={enteredData.email}
                onChange={handleChange}
                className="login-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">パスワード</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="パスワード"
                value={enteredData.password}
                onChange={handleChange}
                className="login-input"
              />
            </div>
            <button type="submit" className="loginButton">
              ログイン
            </button>
          </form>
        </div>
        {errorMessage && <p className="errorms">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;
