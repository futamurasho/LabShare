import { useState } from "react";
import { Link } from "react-router-dom";
import "./GraphDisplay.css";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

let fit = true;

const GraphDisplay = ({ professors, filteredProfessors }) => {
  const [selectedNode, setSelectedNode] = useState(null); // 選択されたノードを管理
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [layoutDone, setLayoutDone] = useState(false); // レイアウト完了フラグ
  const [cyInstance, setCyInstance] = useState(null); // `cy`インスタンスを保存

  const clusterColors = [
    "#ff6666", // 赤系
    "#66ff66", // 緑系
    "#6666ff", // 青系
    "#ffcc66", // オレンジ系
    "#66ccff", // 水色系
    "#dc97ff", // 紫系
    "#ff9999", // ピンク系
    "#00b3b3", // ライトグリーン系
    "#888888", // グレー系
    "#ff66cc", // マゼンタ系（追加）
  ]; //固定の色セット

  //クリックイベント
  const handleNodeClick = (event) => {
    const node = event.target;
    const nodeId = node.data("id");

    if (selectedNode === nodeId) {
      // 既に選択されているノードを再クリックした場合
      setSelectedNode(null);
      setSelectedProfessor(null);
      console.log("Deselected professor");
    } else {
      // 新しくノードを選択した場合
      setSelectedNode(nodeId);
      const professorIndex = parseInt(nodeId.replace("prof-", ""), 10);
      const professor = professors[professorIndex];
      setSelectedProfessor(professor);
      console.log("Selected professor:", professor);
    }
  };

  // ボタンのクリックでグラフを元の位置に戻す
  const handleFitButtonClick = () => {
    if (cyInstance) {
      cyInstance.fit();
      console.log("Graph reset to fit view.");
    }
  };

  //マウスオーバーイベント
  // const handleNodeMouseOver = (event) => {
  //   const node = event.target;
  //   const position = node.renderedPosition(); // ノードのレンダリングされた位置を取得
  //   const container = document
  //     .querySelector(".custom-cytoscape-container")
  //     .getBoundingClientRect(); // コンテナの位置とサイズを取得
  //   console.log(container);
  //   setPopupData({
  //     fullName: node.data("fullName"),
  //     lab: node.data("lab"),
  //   }); // ポップアップに表示するデータを設定
  //   // ポップアップの初期位置
  //   // ポップアップの位置計算
  //   const popupX = container.left + position.x; // コンテナの左端 + ノードの x 座標
  //   const popupY = container.top + position.y + 100; // コンテナの上端 + ノードの y 座標

  //   setPopupPosition({ x: popupX, y: popupY });
  //   console.log("Mouse over node:", node.data("id"), "at", position);
  // };

  // //マウスアウトイベント
  // const handleNodeMouseOut = () => {
  //   setPopupData(null); // マウスがノードから離れたらポップアップを非表示に
  // };

  // ノードとエッジの整形
  const nodes = professors.map((professor, index) => {
    // 肩書きを取り除くための正規表現
    const titleRegex = /(教授|准教授|特別主幹教授|主幹教授)$/;

    // 肩書きを取り除いた名前を取得
    const cleanName = professor.name.replace(titleRegex, "").trim();
    // 名前を分割（外国人名に対応: フルネームを空白で分割）
    const nameParts = cleanName.split(" ");

    // 短縮名の作成
    let shortName = cleanName;

    if (cleanName.length >= 7) {
      // 名前が6文字以上の場合のみ短縮
      if (nameParts.length > 1) {
        shortName = `${nameParts[0]} ${nameParts[1][0]}.`; // 例: "John D."
      } else {
        shortName = `${cleanName.slice(0, 4)}…`; // 例: "Alex…"（分割できない場合のフォールバック）
      }
    }

    return {
      data: {
        id: `prof-${index}`,
        label: shortName, // 名字のみ表示
        fullName: professor.name, // フルネームを別フィールドに保持
        lab: professor.lab, // ラボ情報を保持
        department: professor.department,
        cluster: String(professor.cluster), // 必ず文字列として扱う
        centroid: professor.centroid,
      },
    };
  });

  // クラスタ内の教員同士のエッジ
  const intraClusterEdges = professors.flatMap((professor, index) =>
    professor.similarities
      .filter(
        (similarity) =>
          similarity.similarity >= 0.73 &&
          professors.find((p) => p.name === similarity.name)?.cluster ===
            professor.cluster
      )
      .map((similarity) => ({
        data: {
          id: `edge-${index}-${similarity.name}`,
          source: `prof-${index}`,
          target: `prof-${professors.findIndex(
            (p) => p.name === similarity.name
          )}`,
          weight: similarity.similarity,
          cluster: String(professor.cluster),
        },
      }))
  );

  // クラスタ内の重心ノード（代表教員）を取得
  const centroidNodes = nodes.filter((node) => node.data.centroid);

  // 重心間エッジを作成
  const interCentroidEdges = centroidNodes.flatMap((centroid1) =>
    centroidNodes
      .filter((centroid2) => centroid1.data.cluster !== centroid2.data.cluster) // 異なるクラスタ
      .map((centroid2) => {
        // centroid1 の `similarities` 配列から centroid2 の類似度を取得
        const similarityData = professors
          .find((prof) => prof.name === centroid1.data.fullName)
          ?.similarities.find((sim) => sim.name === centroid2.data.fullName);

        // 類似度が見つからない場合のデフォルト値
        const similarity = similarityData ? similarityData.similarity : 0;

        return {
          data: {
            id: `centroid-edge-${centroid1.data.id}-${centroid2.data.id}`,
            source: centroid1.data.id,
            target: centroid2.data.id,
            similarity: similarity, // 類似度
            weight: similarity > 0 ? 1 / similarity : 1000, // 類似度が0の場合は大きな定数を設定
          },
        };
      })
  );

  const edges = [...intraClusterEdges, ...interCentroidEdges];

  const elements = [...nodes, ...edges];

  // スタイル
  const style = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        width: 30,
        height: 30,
        color: "#000",
        fontSize: 5,
        textHalign: "center",
        textValign: "center",
        borderWidth: (ele) =>
          filteredProfessors.some(
            (prof) => `prof-${professors.indexOf(prof)}` === ele.data().id
          )
            ? 3
            : 0,
      },
    },
    {
      selector: "edge",
      style: {
        width: 1,
        curveStyle: "straight",
        opacity: 0.3,
      },
    },
    {
      selector: 'edge[id^="centroid"]',
      style: {
        lineColor: "#888", // 重心間エッジは赤色
        opacity: 0.1,
        width: 7,
      },
    },
    // クラスタ内のエッジの色を設定
    ...Array.from(new Set(professors.map((p) => p.cluster))).map(
      (cluster, index) => ({
        selector: `edge[cluster = "${cluster}"]`,
        style: {
          //選択されたら色の変更を行う
          lineColor: (ele) =>
            selectedNode &&
            (ele.data("source") === selectedNode ||
              ele.data("target") === selectedNode)
              ? "#000"
              : clusterColors[cluster],
          width: (ele) =>
            selectedNode &&
            (ele.data("source") === selectedNode ||
              ele.data("target") === selectedNode)
              ? 3
              : 1,
        },
      })
    ),
    // クラスタごとにノードの色を設定
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((cluster) => ({
      selector: `node[cluster = "${cluster}"]`,
      style: {
        backgroundColor: clusterColors[cluster], // クラスタIDに対応する色を適用
      },
    })),
  ];

  // レイアウト
  const layout = {
    name: "cose", // "cose"はエッジの長さを考慮するレイアウト
    fit: false, // 表示領域に収めるß
    padding: 50, // 枠との余白
    nodeRepulsion: 4500, // ノードの反発力を増加
    idealEdgeLength: 100, // エッジの理想的な長さ
    edgeElasticity: (edge) => {
      if (edge.data("id").startsWith("centroid-edge")) {
        // 重心間エッジ: 逆数の1000倍
        return edge.data("weight") * 500;
      }
      // 他のエッジ: 逆数の500倍
      return (1 / edge.data("weight")) * 500;
    },
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          pointerEvents: layoutDone ? "auto" : "none", // クリック制御(レイアウトが確定したらクリック可能に)
        }}
      >
        <div
          style={{
            position: "relative", // 子要素の位置指定の基準
            width: "80%", // 枠の幅
            height: "80%", // 枠の高さ
            border: "2px solid #ddd",
            overflow: "hidden", // 枠外を非表示にする設定
          }}
        >
          {/* 右上に配置するボタン */}
          <button
            onClick={handleFitButtonClick}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              backgroundColor: "#96c70f",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              padding: "10px 15px",
              cursor: "pointer",
              zIndex: 1, // ボタンを最前面に表示
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Reset Position
          </button>
          <CytoscapeComponent
            elements={elements}
            style={{ width: "100%", height: "100%" }}
            stylesheet={style}
            layout={layout}
            className="custom-cytoscape-container"
            cy={(cy) => {
              // レイアウト終了時にフラグを更新
              cy.on("layoutstop", () => {
                setCyInstance(cy); // `cy`インスタンスを保存
                //画面リロードした時にのみfitさせる
                if (fit) {
                  fit = false;
                  cy.fit();
                }
                // console.log("Layout finished");
                setLayoutDone(true); // レイアウト終了フラグを設定
                // 全ノードをロック
                cy.nodes().forEach((node) => {
                  node.lock();
                });
                // console.log("All nodes have been locked.");
              });
              // ノードクリックイベント
              cy.on("click", "node", handleNodeClick);
              cy.on("tap", "node", handleNodeClick);
              // cy.on("mouseover", "node", handleNodeMouseOver); // マウスがノードに入ったとき
              // cy.on("mouseout", "node", handleNodeMouseOut); // マウスがノードから離れたとき
            }}
          />
        </div>
      </div>
      {/* 教員の詳細情報表示 */}
      {selectedProfessor && (
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#fff",
            color: "#000",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            width: "80%",
            margin: "20px auto",
            textAlign: "left", // 左揃え
          }}
        >
          <h3>教員詳細情報</h3>
          <p>
            <strong>氏名:</strong> {selectedProfessor.name}
          </p>
          <p>
            <strong>研究室:</strong>{" "}
            <Link
              to={`/Lab/${selectedProfessor.lab_id}`}
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontWeight: "bold",
              }}
            >
              {selectedProfessor.lab}
            </Link>
          </p>
          <p>
            <strong>専攻:</strong> {selectedProfessor.department}
          </p>
          <p>
            <strong>キーワード:</strong> {selectedProfessor.keywords.join(", ")}
          </p>
          <p>
            <a
              href={selectedProfessor.website}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontWeight: "bold",
              }}
            >
              <strong>卒論テーマ集(ない場合は個人ページ)</strong>{" "}
            </a>
          </p>
        </div>
      )}
    </>
  );
};

export default GraphDisplay;
