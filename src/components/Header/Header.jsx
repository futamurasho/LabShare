import { Link } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useDispatchUser } from "../../contexts/UserContext";
import userApi from "../../api/user";
import "./Header.css";

const Header = () => {
  const state = useUser();
  const dispatch = useDispatchUser();
  const [menuOpen, setMenuOpen] = useState(false); // ハンバーガーメニューの開閉状態

  const handleLogout = () => {
    // ログアウト確認ポップアップssss
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
  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // メニューの開閉状態をトグル
  };

  return (
    <>
      <header className="header">
        <div className="header__inner">
          {/* ログインしている場合、「ようこそ〜さん」を左端に表示 */}
          {state && state.username && (
            <h2 className="header__welcome">ようこそ {state.username} さん</h2>
          )}

          {/* ハンバーガーメニューアイコン */}
          <div className="header__hamburger" onClick={toggleMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>

          {/* メニューリンクを右端に表示 */}
          <nav className={`header__nav ${menuOpen ? "open" : ""}`}>
            <ul className="header__ul">
              <li className="header__list">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfayV_YIkWEvFy0-op1qY2QJP338_I8rn-nCGxDBl2iSc_thQ/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  アンケート
                </a>
              </li>
              <li className="header__list">
                <Link to="/">研究室一覧</Link>
              </li>
              <li className="header__list">
                <Link to="/graph">教員グラフ</Link>
              </li>
              <li className="header__list">
                <Link to="/mygraph">マイグラフ</Link>
              </li>
              {state && state.username ? (
                <li className="header__list">
                  <a href="#" onClick={handleLogout}>
                    ログアウト
                  </a>
                </li>
              ) : (
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
