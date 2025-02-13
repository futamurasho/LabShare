import { useEffect, useState } from "react";
import professorApi from "../../api/professor";
import Header from "../../components/Header/Header";
import { useUser } from "../../contexts/UserContext";
import "./MyGraph.css";
import React from "react";
import MyGraphDisplay from "../../components/MyGraph/MyGraphDisplay/MyGraphDisplay";
import MySqueeze from "../../components/MyGraph/MySqueeze/MySqueeze";

const MyGraph = () => {
  const state = useUser(); //ユーザ情報
  const [professors, setProfessor] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]); // フィルタリング結果
  const [loading, setLoading] = useState(true); // ローディング状態を追加

  //APIから教員データ取得
  useEffect(() => {
    professorApi.getAll().then((_professors) => {
      setProfessor([..._professors]);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <h2 style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
          マイネットワークグラフ
        </h2>
        <p>
          行きたい専攻と興味あるキーワードを入力して「推薦」ボタンを押すと，入力に合う教員が推薦され，グラフで確認できます
          <br />
          推薦の程度は赤，黄色，グレーの段階に分かれています．
          <br />
          ノードはクリックするとグラフ下に詳細情報が表示されます。
        </p>
      </div>
      <MySqueeze
        professors={professors}
        setFilteredProfessors={setFilteredProfessors}
      />
      <MyGraphDisplay professors={filteredProfessors} />
    </>
  );
};

export default MyGraph;
