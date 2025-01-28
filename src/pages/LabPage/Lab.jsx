import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import labApi from "../../api/labs";
import userApi from "../../api/user";
import commentApi from "../../api/comments";
import Header from "../../components/Header/Header";
import "./Lab.css";
import { IoMdArrowDropright } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { useUser, useDispatchUser } from "../../contexts/UserContext";
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";

//研究室情報以下
//{id,name,department,professor[string],website,keywords[string],
//comments[{_id,content,lab_id,user_id,liked[],createdAt,updatedAt}],
//researchPapersCount(int),researchPapers[{professor,count,papers[{title,link,publicationDate}]}],
//researchProductsCount(int),researchProducts[{professor,count,products[string]}]}

// const reducer = (comments,action)=> {
//   switch(action.type){
//     case "comment/update":
//       return [action.comment]
//     case "comment/like":
//       return
//     case "comment/unlike":
//       return

//   }
// }

const Lab = () => {
  const state = useUser();
  const dispatch = useDispatchUser();
  const { id } = useParams();
  const [lab, setLab] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputComment, setInputComment] = useState("");
  const [comments, setComments] = useState([]); // コメントリストの状態
  const [likedLabs, setLikedLabs] = useState([]); //お気に入り研究室
  useEffect(() => {
    labApi
      .get(id)
      .then((data) => {
        setLab(data);
        setComments(data.comments || []);
        console.log("データは:", data);
      })
      .catch((error) => {
        console.error("Error fetching research papers:", error);
      });
  }, [id]);

  useEffect(() => {
    if (state.likedLab) {
      setLikedLabs(state.likedLab);
      console.log("Liked Labs:", state.likedLab);
    }
  }, [state.likedLab]);

  // お気に入り追加・削除ボタンのハンドラー
  const handleLike = (commentId, liked) => {
    const hasLiked = Array.isArray(liked) && liked.includes(state.id);
    // いいね機能をトグル
    if (hasLiked) {
      commentApi
        .unlikeComment(commentId, state.id)
        .then((updatedComment) => {
          console.log(updatedComment);
          setComments(
            comments.map((c) => (c._id === commentId ? updatedComment : c))
          );
        })
        .catch((error) => {
          console.error("Error unliking comment:", error);
        });
    } else {
      commentApi
        .likeComment(commentId, state.id)
        .then((updatedComment) => {
          console.log(updatedComment);
          setComments(
            comments.map((c) => (c._id === commentId ? updatedComment : c))
          );
        })
        .catch((error) => {
          console.error("Error liking comment:", error);
        });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (inputComment.trim() === "") return;

    labApi
      .addComment(id, inputComment, state.id) // コメント送信のAPI呼び出し
      .then((addedComment) => {
        console.log(addedComment);
        setComments([...comments, addedComment]); // 新しいコメントを追加
        setInputComment(""); // 入力フィールドをクリア
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  const handleCommentdelete = (commentId) => {
    //コメント削除ポップアップ
    const confirmDelete = window.confirm("コメントを削除しますか？");
    if (confirmDelete) {
      try {
        labApi.deleteComment(id, commentId, state.id).then(() => {
          setComments(comments.filter((comment) => comment._id !== commentId));
        });
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  if (!lab) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="Lab_data">
        <h1>{lab.name}</h1>
        <div className="lab-info">
          <p>
            <span className="label">専攻</span>
            {lab.department}
          </p>
          <p>
            <span className="label">メンバー</span>
            {lab.professor.join(", ")}
          </p>
          <p>
            <span className="label">キーワード</span>
            {lab.keywords.join(", ")}
          </p>

          <div className="research-activities">
            <h2>
              <span
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {isExpanded ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}{" "}
                研究活動(2023~)
              </span>
            </h2>
            {isExpanded && (
              <>
                {lab.researchPapers.map((prof, index) => (
                  <div key={index} className="professor-section">
                    <h3>{prof.professor}</h3>

                    {/* 研究論文 */}
                    <div className="section-content">
                      <h4>
                        研究論文 (論文数: {prof.count}) -{" "}
                        <a
                          href="https://cir.nii.ac.jp/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CiNiiから参照
                        </a>
                      </h4>
                      <ul>
                        {prof.papers.map((paper, paperIndex) => (
                          <li key={paperIndex}>
                            <a
                              href={paper.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {paper.title}
                            </a>
                            <span className="publication-date">
                              （発表日: {paper.publicationDate}）
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 研究成果 */}
                    {lab.researchProducts && lab.researchProducts[index] && (
                      <div className="section-content">
                        <h4>
                          研究成果title (成果数:{" "}
                          {lab.researchProducts[index].count}) -{" "}
                          <a
                            href="https://nrid.nii.ac.jp/index/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            KAKENから参照
                          </a>
                        </h4>
                        <ul>
                          {lab.researchProducts[index].products.map(
                            (product, productIndex) => (
                              <li key={productIndex}>{product}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            <div className="comments-section">
              <h3>コメント({comments.length})</h3>
              {state.id && (
                <>
                  <form onSubmit={handleCommentSubmit}>
                    <input
                      type="text"
                      value={inputComment}
                      onChange={(e) => setInputComment(e.target.value)}
                      placeholder="コメントを入力"
                    />
                    <button type="submit" className="submit-comment">
                      投稿
                    </button>
                  </form>
                </>
              )}
              {comments.length > 0 ? (
                <div className="comments-list">
                  <ul>
                    {[...comments].reverse().map((comment) => (
                      <li key={comment._id} className="comment-item">
                        <p>{comment.content}</p>
                        <small>
                          投稿日時:{" "}
                          {new Date(comment.createdAt).toLocaleString()}
                        </small>
                        {state.id && (
                          <button
                            onClick={() =>
                              handleLike(comment._id, comment.liked)
                            }
                          >
                            {comment.liked &&
                            comment.liked.includes(state.id) ? (
                              <AiFillLike />
                            ) : (
                              <AiOutlineLike />
                            )}
                            ({comment.liked ? comment.liked.length : 0})
                          </button>
                        )}
                        {state.id === comment.user_id ? (
                          <button
                            onClick={() => handleCommentdelete(comment._id)}
                          >
                            削除
                          </button>
                        ) : (
                          ""
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="no-comments">コメントがありません</p>
              )}
              {/* <div className="comments-list">
                <ul>
                  {[...comments].reverse().map((comment) => (
                    <li key={comment._id} className="comment-item">
                      <p>{comment.content}</p>
                      <small>
                        投稿日時: {new Date(comment.createdAt).toLocaleString()}
                      </small>
                      {state.id && (
                        <button
                          onClick={() => handleLike(comment._id, comment.liked)}
                        >
                          {comment.liked && comment.liked.includes(state.id) ? (
                            <AiFillLike />
                          ) : (
                            <AiOutlineLike />
                          )}
                          ({comment.liked ? comment.liked.length : 0})
                        </button>
                      )}
                      {state.id === comment.user_id ? (
                        <button
                          onClick={() => handleCommentdelete(comment._id)}
                        >
                          削除
                        </button>
                      ) : (
                        ""
                      )}
                    </li>
                  ))}
                </ul>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lab;
