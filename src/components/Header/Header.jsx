import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useDispatchUser } from "../../contexts/UserContext";
import userApi from "../../api/user";
import "./Header.css";

const Header = () => {
  const state = useUser();
  const dispatch = useDispatchUser();

  const handleLogout = () => {
    // ログアウト確認ポップアップ
    const confirmLogout = window.confirm("ログアウトしますか？");
    if (confirmLogout) {
      try {
        userApi.logout().then(() => {
          dispatch({ type: "user/logout" });
        });
      } catch (error) {
        console.error("ログアウトに失敗しました", error);
      }
    }
  };

  // const handleLogout = () => {
  //   // ログアウト処理
  //   try {
  //     userApi.logout().then(() => {
  //       dispatch({ type: "user/logout" });
  //     });
  //   } catch (error) {
  //     console.error("ログアウトに失敗しました", error);
  //   }
  // };

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="labs-link">
            研究室一覧
          </Link>
          {state && state.username && (
            <h2 className="header__welcome">ようこそ {state.username}さん</h2>
          )}
          <nav className="header__nav">
            <ul className="header__ul">
              {state && state.username ? (
                // ユーザーがログインしている場合
                <li className="header__list">
                  <a href="#" onClick={handleLogout} className="logout-link">
                    ログアウト
                  </a>
                </li>
              ) : (
                // ユーザーがログインしていない場合
                <>
                  <li className="header__list">
                    <Link to="/login">ログイン</Link>
                  </li>
                  <li className="header__list">
                    <Link to="/register">新規登録</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
