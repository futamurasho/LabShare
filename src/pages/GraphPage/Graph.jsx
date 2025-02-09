import { useEffect, useState } from "react";
import professorApi from "../../api/professor";
import Header from "../../components/Header/Header";
import { useUser } from "../../contexts/UserContext";
import "./Graph.css";
import React from "react";
import GraphDisplay from "../../components/GraphDisplay/GraphDisplay";
import DBSCANgraph from "../../components/DBSCAN/DBSCAN";
import Squeeze from "../../components/Squeeze/Squeeze";

const Graph = () => {
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
          教員ネットワークグラフ
        </h2>
        <p>
          このグラフは、教員の研究内容に関するキーワードを基にしてクラスタリングを行った結果のネットワーク図です。
          <br />
          以下の入力フィールドに入力すると，当てはまる教員のノードが黒い枠に囲まれます。
          <br />
          ノードはクリックするとグラフ下に詳細情報が表示されます。
        </p>
      </div>
      <Squeeze
        professors={professors}
        setFilteredProfessors={setFilteredProfessors}
      />
      <GraphDisplay
        professors={professors}
        filteredProfessors={filteredProfessors}
      />
      {/* <DBSCANgraph
        professors={professors}
        filteredProfessors={filteredProfessors}
      /> */}
    </>
  );
};

export default Graph;
