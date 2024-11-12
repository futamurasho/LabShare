import { useEffect, useState } from "react";
import labApi from "../../api/labs"; // 研究室情報を取得するAPIをインポート
import Header from "../../components/Header/Header";
// import ButtonAppBar from "../../components/Header/Headertest";
import Search from "../../components/Search/Search";
import { useUser } from "../../contexts/UserContext";
import "./Labs.css";
import LabsContainer from "../../components/labsContainer/labsContainer";

const Labs = () => {
  const state = useUser(); //ユーザ情報
  const [labs, setLabs] = useState([]); //表示する研究室
  const [likedLabs, setLikedLabs] = useState([]); //お気に入り研究室
  const [loading, setLoading] = useState(true); // ローディング状態を追加

  // 初期化：APIから研究室データを取得
  useEffect(() => {
    labApi.getAll().then((_labs) => {
      setLabs([..._labs]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (state.likedLab) {
      setLikedLabs(state.likedLab);
    }
  }, [state.likedLab]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <Search setLabs={setLabs} likedLabs={likedLabs} />
      <LabsContainer likedLabs={likedLabs} labs={labs} />
    </>
  );
};

export default Labs;
