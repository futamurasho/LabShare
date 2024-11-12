import { Link } from "react-router-dom";
import userApi from "../../api/user";
import { useUser, useDispatchUser } from "../../contexts/UserContext";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";
import "./LabsContainer.css";

const LabsContainer = ({ likedLabs, labs }) => {
  const state = useUser(); //ユーザ情報
  const dispatch = useDispatchUser(); //ユーザのdispatch
  // お気に入り追加・削除ボタンのハンドラー
  const HandleFavorite = (labId) => {
    // すでにお気に入りに登録されているかを確認
    let isFavorite = false;
    if (likedLabs) {
      isFavorite = likedLabs.includes(labId);
    }

    if (isFavorite) {
      // お気に入りから削除
      userApi
        .unlikeLab(state.id, labId)
        .then((updatedLikedLab) => {
          dispatch({ type: "user/unlike", likedLab: updatedLikedLab.likedLab });
        })
        .catch((error) => {
          console.error("お気に入り削除エラー:", error);
        });
    } else {
      // お気に入りに追加
      userApi
        .likeLab(state.id, labId)
        .then((updatedLikedLab) => {
          dispatch({ type: "user/like", likedLab: updatedLikedLab.likedLab });
        })
        .catch((error) => {
          console.error("お気に入り登録エラー:", error);
        });
    }
  };

  return (
    <div className="labs-container">
      <ul className="labs-list">
        {labs.map((lab) => (
          <li key={lab._id} className="lab-card">
            <Link to={`/Lab/${lab._id}`} className="lab-card-link">
              <h2>{lab.name}</h2>
              <p>
                <span className="label">専攻</span>
                <span>:</span>
                <span className="value">{lab.department}</span>
              </p>
              <p>
                <span className="label">メンバー</span>
                <span>:</span>
                <span className="value">{lab.professor.join(", ")}</span>
              </p>
              <p>
                <span className="label">キーワード</span>
                <span>:</span>
                <span className="value">
                  {lab.keywords.slice(0, 5).join(", ")}
                </span>
              </p>
              <p>
                <span className="label">コメント数</span>
                <span>:</span>
                <span className="value">{lab.comments.length}</span>
              </p>
              <p>
                <span className="label">お気に入り数</span>
                <span>:</span>
                <span className="value">{lab.like}</span>
              </p>
            </Link>
            {state.id && (
              <button
                onClick={() => HandleFavorite(lab._id)}
                className="favorite-button"
              >
                {likedLabs && likedLabs.includes(lab._id) ? (
                  <MdFavorite style={{ color: "#ff0000" }} />
                ) : (
                  <MdFavoriteBorder style={{ color: "#000000" }} />
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabsContainer;
