import labApi from "../../api/labs"; // 研究室情報を取得するAPIをインポート
import { useState } from "react";
import "./Search.css";
import { useUser } from "../../contexts/UserContext";
const Search = ({ setLabs, likedLabs }) => {
  const [query, setQuery] = useState({
    name: "",
    department: "",
    professor: "",
    keywords: "",
  });
  const [sort, setSort] = useState("");
  const [queryComment, setQueryComment] = useState(""); //無表示，「検索条件を入力してください」,「研究室が見つかりませんでした」
  const departmentOPTIONS = ["", "情報理工学専攻", "電気電子工学専攻"];
  const sortOPTIONS = ["", "コメント数", "お気に入り数"];
  const state = useUser();
  const [favoriteFlag, setFavoriteFlag] = useState(false);
  // 入力変更ハンドラー
  const searchInput = (e) => {
    const { name, value } = e.target;
    setQuery((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //クエリがemptyかどうか
  const isQueryEmpty = (query) => {
    return (
      query.name === "" &&
      query.department === "" &&
      query.professor === "" &&
      query.keywords === ""
    );
  };

  //検索
  const SearchLB = (e) => {
    e.preventDefault();
    if (sort !== "" && isQueryEmpty) {
      labApi.getAll().then((_labs) => {
        // ソートの適用
        if (sort === "コメント数") {
          _labs.sort((a, b) => b.comments.length - a.comments.length); // commentsリストの長さでソート
        } else if (sort === "お気に入り数") {
          _labs.sort((a, b) => b.like - a.like); // likeの値でソート
        }
        setLabs([..._labs]);
        setQueryComment("");
      });
    } else {
      labApi
        .searchLab(query)
        .then((_labs) => {
          let filteredLabs = _labs;
          if (favoriteFlag) {
            filteredLabs = _labs.filter((lab) => likedLabs.includes(lab._id));
          }
          // ソートの適用
          if (sort === "コメント数") {
            filteredLabs.sort((a, b) => b.comments.length - a.comments.length); // commentsリストの長さでソート
          } else if (sort === "お気に入り数") {
            filteredLabs.sort((a, b) => b.like - a.like); // likeの値でソート
          }

          if (filteredLabs.length === 0) {
            setQueryComment("研究室が見つかりませんでした");
          } else {
            setLabs([...filteredLabs]);
            setQueryComment("");
          }
        })
        .catch((error) => {
          console.error("検索エラー:", error);
          setQueryComment(error);
        });
    }
  };

  const reset = () => {
    setQuery({
      name: "",
      department: "",
      professor: "",
      keywords: "",
    });
    setSort("");
    labApi.getAll().then((allLabs) => {
      setLabs([...allLabs]); // 全ての研究室データを表示
      setQueryComment("");
      setFavoriteFlag(false);
    });
  };

  // お気に入りのみ表示
  const showLikedLabs = () => {
    if (!favoriteFlag) {
      labApi.getAll().then((allLabs) => {
        setLabs([...allLabs.filter((lab) => likedLabs.includes(lab._id))]);
        setQueryComment("");
        setFavoriteFlag(true);
      });
    } else {
      labApi.getAll().then((allLabs) => {
        setLabs([...allLabs]); // 全ての研究室データを表示
        setQueryComment("");
      });
      setFavoriteFlag(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={SearchLB}>
        <div>
          <label>研究室名</label>
          <input
            type="text"
            placeholder="研究室名から検索..."
            name="name"
            value={query.name}
            onChange={searchInput}
            className="search-input"
          />
          {/* <button
              type="submit"
              style={{ marginLeft: "10px" }}
              className="search-button"
            >
              検索
            </button> */}
        </div>
        <div>
          <label>専攻</label>
          <select
            name="department"
            value={query.department}
            onChange={searchInput}
            className="searchselect"
          >
            {departmentOPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>教員名</label>
          <input
            type="text"
            placeholder="教員名から検索..."
            name="professor"
            value={query.professor}
            onChange={searchInput}
            className="search-input"
          />
        </div>
        <div>
          <label>キーワード</label>
          <input
            type="text"
            placeholder="キーワードから検索..."
            name="keywords"
            value={query.keywords}
            onChange={searchInput}
            className="search-input"
          />
        </div>
        <div>
          <label>ソート</label>
          <select
            name="department"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="searchselect"
          >
            {sortOPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {state.id && (
            <button
              type="button"
              className="search-button"
              style={{ marginRight: "10px" }}
              onClick={showLikedLabs} // お気に入りのみ表示
            >
              {favoriteFlag ? "全ての研究室を表示" : "お気に入り表示"}
            </button>
          )}
          <button
            type="button"
            className="search-button"
            onClick={reset}
            style={{ marginRight: "10px" }} // 検索ボタンとの間に余白
          >
            リセット
          </button>
          <button type="submit" className="search-button">
            検索
          </button>
        </div>
      </form>
      <p className="error-message">{queryComment}</p>
    </div>
  );
};

export default Search;
