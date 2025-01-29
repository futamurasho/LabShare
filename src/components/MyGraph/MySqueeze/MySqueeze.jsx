import { useState } from "react";
import React from "react";
import "./MySqueeze.css";
import Select from "react-select";
import keywordOPTIONS from "../../../assets/keywords.json";
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;
console.log("FASTAPI_URL:", FASTAPI_URL); // デバッグ用

const Squeeze = ({ professors, setFilteredProfessors }) => {
  const departmentOPTIONS = ["", "情報理工学専攻", "電気電子工学専攻"];

  const [query, setQuery] = useState({
    department: "",
    keywords: [],
  });

  // 入力変更ハンドラー
  const searchInput = (e) => {
    const { name, value } = e.target;
    setQuery((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // キーワード選択変更ハンドラー
  const handleKeywordsChange = (selectedOptions) => {
    setQuery((prevData) => ({
      ...prevData,
      keywords: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };

  const reset = () => {
    setQuery({
      department: "",
      keywords: [],
    });
    setFilteredProfessors([]);
  };

  //絞り込み
  // 検索処理(推薦処理に変更)
  const sq = async (e) => {
    e.preventDefault();

    // キーワードが空の場合、処理をスキップしてリセット
    if (query.keywords.length === 0) {
      setFilteredProfessors([]);
      return;
    }
    try {
      // FastAPIエンドポイントにPOSTリクエストを送信
      const response = await fetch(`${FASTAPI_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department: query.department,
          keywords: query.keywords,
        }),
      });
      console.log({
        department: query.department,
        keywords: query.keywords,
      });
      // レスポンスをJSON形式で取得
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // recommendationsのnameを取得
        const recommendedNames = data.recommendations.map((rec) => rec.name);

        // professorsからnameが一致するものだけをフィルタリング
        const filtered = professors.filter((professor) =>
          recommendedNames.includes(professor.name)
        );

        // フィルタ結果を設定
        setFilteredProfessors(filtered);
      } else {
        console.error("APIエラー:", data.detail); // エラー詳細をログ出力
        setFilteredProfessors([]); // 推薦結果をリセット
      }
    } catch (error) {
      console.error("ネットワークエラー:", error);
      setFilteredProfessors([]); // 推薦結果をリセット
    }
  };

  // カスタムスタイル
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      overflowY: "auto", // 縦スクロールを有効化
      maxHeight: "200px", // メニューの高さを制限
    }),
    option: (provided) => ({
      ...provided,
      display: "block", // 各オプションを縦に並べる
      color: "#000",
      whiteSpace: "nowrap", // テキストを折り返さない
      textAlign: "left", // 左揃え
      padding: "10px", // オプションに余白を追加
    }),
  };

  return (
    <>
      <div className="squeeze-container">
        <form onSubmit={sq}>
          <div className="not-keywords">
            <label>専攻</label>
            <select
              name="department"
              value={query.department}
              onChange={searchInput}
              className="departmentselect"
            >
              {departmentOPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="keywords">
            <label>キーワード</label>
            <Select
              options={keywordOPTIONS}
              isMulti
              value={query.keywords.map((keyword) => ({
                value: keyword,
                label: keyword, // 必要に応じてラベルをカスタマイズ
              }))} // 状態に基づいて選択状態を管理
              onChange={handleKeywordsChange}
              styles={customStyles} // カスタムスタイルを適用
              placeholder="キーワードを選択...(複数可)"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="squeeze-button"
              onClick={reset}
              style={{ marginRight: "10px" }} // 検索ボタンとの間に余白
            >
              リセット
            </button>
            <button type="submit" className="squeeze-button">
              推薦
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Squeeze;
