import { useState } from "react";
import React from "react";
import "./Squeeze.css";
import Select from "react-select";
import keywordOPTIONS from "../../assets/keywords.json";

const Squeeze = ({ professors, setFilteredProfessors }) => {
  const departmentOPTIONS = ["", "情報理工学専攻", "電気電子工学専攻"];

  const [query, setQuery] = useState({
    professor: "",
    department: "",
    lab: "",
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
      professor: "",
      department: "",
      lab: "",
      keywords: [],
    });
    setFilteredProfessors([]);
  };

  //絞り込み
  // 検索処理
  const sq = (e) => {
    e.preventDefault();
    // 全てのクエリが空の場合、フィルタリングせず空リストを設定
    if (
      query.professor === "" &&
      query.lab === "" &&
      query.department === "" &&
      query.keywords.length === 0
    ) {
      setFilteredProfessors([]);
      return;
    }

    const filtered = professors.filter((professor) => {
      const matchesProfessor =
        query.professor === "" || professor.name.includes(query.professor); // 教員名一致

      const matchesLab = query.lab === "" || professor.lab.includes(query.lab); // 研究室名一致

      const matchesDepartment =
        query.department === "" || professor.department === query.department;

      const matchesKeywords =
        query.keywords.length === 0 ||
        query.keywords.every((keyword) => professor.keywords.includes(keyword)); // キーワード一致

      return (
        matchesProfessor && matchesLab && matchesDepartment && matchesKeywords
      );
    });

    setFilteredProfessors(filtered); // フィルタリング結果を設定
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
            <label>教員名</label>
            <input
              type="text"
              placeholder="教員名から検索..."
              name="professor"
              value={query.professor}
              onChange={searchInput}
              className="squeeze-input"
            />
          </div>
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
          <div className="not-keywords">
            <label>研究室名</label>
            <input
              type="text"
              placeholder="研究室名から検索..."
              name="lab"
              value={query.lab}
              onChange={searchInput}
              className="squeeze-input"
            />
          </div>
          <div className="keywords">
            <label>キーワード</label>
            <Select
              options={keywordOPTIONS}
              isMulti
              onChange={handleKeywordsChange}
              styles={customStyles} // カスタムスタイルを適用
              placeholder="キーワードを選択..."
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
              検索
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Squeeze;
