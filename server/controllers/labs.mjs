import express from "express";
import Lab from "../models/labs.mjs";
import Comment from "../models/comment.mjs";
import mongoose from "mongoose";
import axios from "axios";
import xml2js from "xml2js";
import env from "dotenv";
env.config();

// 研究者名で論文情報を取得する非同期関数
async function fetchResearchPapers(researcherName) {
  const baseURL = `https://cir.nii.ac.jp/opensearch/articles?creator=${encodeURIComponent(
    researcherName
  )}&format=rss&count=200&sortorder=0&from=2023`;

  try {
    // 論文データを取得
    const response = await axios.get(baseURL, { timeout: 5000 });
    const rssData = response.data;

    // XMLを解析してJSON形式に変換
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(rssData);

    // itemを取り出してリンクと作成日時を抽出
    //他にも取得できる
    const items = result["rdf:RDF"].item;
    const papers = items.map((item) => ({
      title: item.title ? item.title[0] : "N/A",
      link: item.link ? item.link[0] : "N/A",
      publicationDate: item["prism:publicationDate"]
        ? item["prism:publicationDate"][0]
        : "N/A",
    }));

    return {
      count: papers.length, // 論文数
      papers, // 論文情報
    };
  } catch (error) {
    // if (error.code === "ECONNABORTED") {
    //   console.error("Request timed out:", error.message);
    // } else {
    //   console.error("Error fetching research papers:", error.message);
    // }
    return {
      count: 0,
      papers: [],
    };
  }
}

//KAKENから2023以降の研究成果取得
async function getResearchProduct(name) {
  const URL = `https://nrid.nii.ac.jp/opensearch/?appid=${
    process.env.APP_ID
  }&qg=${encodeURIComponent(name)}&qh=九州大学&format=json`;

  try {
    // KAKEN APIにリクエストを送信
    const response = await axios.get(URL, { timeout: 5000 });

    const data = response.data;
    const titlesFrom2023 = [];

    // 各研究者のデータから2023年以降の研究成果を抽出
    data.researchers.forEach((researcher) => {
      researcher["work:product"].forEach((product) => {
        const publicationYear =
          product["date:publicationDate"]?.["commonEra:year"];
        const title = product["title:main"]?.text;

        // 2023年以降の成果のみ追加
        if (publicationYear && publicationYear >= 2023 && title) {
          titlesFrom2023.push(title);
        }
      });
    });

    // 結果を返却
    return {
      workproduct: titlesFrom2023,
      totalCount: titlesFrom2023.length,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out:", error.message);
    } else {
      console.error("Error fetching data:", error);
    }
    return {
      workproduct: [],
      totalCount: 0,
    };
  }
}

async function getAllLabs(req, res) {
  try {
    const labs = await Lab.find();
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({
      message: "全ての研究室情報の取得に失敗しました",
      error,
    });
  }
}

async function searchLabs(req, res) {
  const { name, department, professor, keywords } = req.body;
  if (!name && !professor && !department && !keywords) {
    return res.status(404).json({ message: "検索条件を入力してください" }); // 204 No Contentを返す
  }

  try {
    // 検索条件の構築
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // 部分一致、大文字小文字を区別しない
    }
    if (department) {
      query.department = { $regex: department, $options: "i" }; // 部分一致、大文字小文字を区別しない
    }
    if (professor) {
      query.professor = { $regex: professor, $options: "i" }; // 部分一致、大文字小文字を区別しない
    }
    if (keywords) {
      query.keywords = { $regex: keywords, $options: "i" }; // 部分一致、大文字小文字を区別しない
    }

    // データベースから検索
    const labs = await Lab.find(query);
    if (labs.length === 0) {
      return res.status(404).json({ message: "研究室が見つかりませんでした" }); // 見つからなければ204を返す
    }
    // 結果を返す
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ message: "検索に失敗しました" });
  }
}

// 研究室情報と論文情報を出力する関数
async function getOneLab(req, res) {
  const _id = req.params.id;

  try {
    // Lab情報を取得し、コメントをpopulate
    const lab = await Lab.findById(_id).populate("comments").exec();

    if (!lab) {
      // 研究室が見つからなかった場合
      return res
        .status(404)
        .json({ message: "指定された研究室が見つかりません" });
    }

    // すべての教授名について「教授」「准教授」を除去し、論文データを取得
    const professors = lab.professor.map((name) =>
      name.replace(/教授|准教授|主幹教授|特別主幹教授/g, "").trim()
    );
    // すべての教授に対して非同期に論文データを取得
    const researchPapersList = await Promise.all(
      professors.map(fetchResearchPapers)
    );

    /// 取得した論文データを集約
    const researchPapers = {
      totalPapersCount: researchPapersList.reduce(
        (sum, data) => sum + data.count,
        0
      ),
      papersByProfessor: researchPapersList.map((data, index) => ({
        professor: lab.professor[index], // 元の教授名を使用
        count: data.count,
        papers: data.papers,
      })),
    };

    // すべての教授に対して非同期にKAKEN APIから研究成果を取得
    const researchProductsList = await Promise.all(
      professors.map(getResearchProduct)
    );

    // 取得した研究成果データを集約
    const researchProducts = {
      totalProductsCount: researchProductsList.reduce(
        (sum, data) => sum + data.totalCount,
        0
      ),
      productsByProfessor: researchProductsList.map((data, index) => ({
        professor: lab.professor[index], // 元の教授名を使用
        count: data.totalCount,
        products: data.workproduct,
      })),
    };

    // 結果をまとめて出力
    res.status(200).json({
      ...lab.toObject(), // 既存のLab情報を展開
      researchPapersCount: researchPapers.totalPapersCount, // 総論文数
      researchPapers: researchPapers.papersByProfessor, // 各教授の論文情報
      researchProductsCount: researchProducts.totalProductsCount, // 総研究成果数
      researchProducts: researchProducts.productsByProfessor, // 各教授の研究成果情報
    });
  } catch (error) {
    // エラー処理
    res.status(500).json({ message: "研究室情報の取得に失敗しました", error });
  }
}

// async function getOneLab(req, res) {
//   const _id = req.params.id;
//   try {
//     const lab = await Lab.findById(_id)
//       .populate("comments") // コメントをpopulateする
//       .exec(); // exec() を使うが、awaitで結果を待つ
//     if (!lab) {
//       // 研究室が見つからなかった場合の404エラー処理
//       return res
//         .status(404)
//         .json({ message: "指定された研究室が見つかりません" });
//     }
//     res.status(200).json(lab); // 研究室情報をレスポンスとして返す
//   } catch (error) {
//     // エラーが発生した場合の500エラー処理
//     res.status(500).json({ message: "研究室情報の取得に失敗しました", error });
//   }
// }

async function createComment(req, res) {
  const lab_id = req.params.id;
  const { content, user_id } = req.body;
  let session;

  try {
    //複数の操作を行うため，トランザクションセッションを開始
    session = await mongoose.startSession();
    session.startTransaction();
    // 新しいコメントを作成
    const newComment = new Comment({
      content,
      lab_id: lab_id, // コメントを対象の研究室に紐付け
      user_id: user_id,
      liked: [], // 初期値としていいね数は0
    });

    // コメントを保存
    const savedComment = await newComment.save({ session });

    // コメントのIDを対応する研究室に追加
    const lab = await Lab.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ message: "研究室が見つかりません" });
    }

    lab.comments.push(savedComment._id); // コメントのIDをLabに追加
    await lab.save({ session });

    // 成功したらトランザクションをコミットして，レスポンスを返す
    await session.commitTransaction();
    res
      .status(201)
      .json({ message: "コメントが追加されました", comment: savedComment });
  } catch (error) {
    if (session) {
      await session.abortTransaction(); // セッションがある場合のみトランザクションを中断
    }
    res.status(500).json({ message: "コメントの追加に失敗しました", error });
  } finally {
    if (session) {
      await session.endSession(); // セッションがある場合のみ終了
    }
  }
}

async function deleteComment(req, res) {
  const { lab_id, comment_id, user_id } = req.params; // パラメータから取得
  let session;
  try {
    //複数の操作を行うため，トランザクションセッションを開始
    session = await mongoose.startSession();
    session.startTransaction();
    //削除するコメント検索
    const deleted_comment = await Comment.findById(comment_id).session(session);
    if (!deleted_comment) {
      await session.abortTransaction();
      return res.status(404).json({ message: "コメントが見つかりません" });
    }

    if (deleted_comment.user_id.toString() !== user_id) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "コメントを削除する権限がありません。" });
    }
    // 研究室検索
    const lab = await Lab.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ message: "研究室が見つかりません" });
    }

    // コメントを削除
    await Comment.findByIdAndDelete(comment_id).session(session);

    // コメントIDをLabのcommentsフィールドから削除
    lab.comments = lab.comments.filter((id) => id.toString() !== comment_id);
    await lab.save({ session });

    // 成功したらトランザクションをコミットして，レスポンスを返す
    await session.commitTransaction();
    res.status(200).json({ message: "コメントが削除されました" });
  } catch (error) {
    if (session) {
      await session.abortTransaction(); // セッションがある場合のみトランザクションを中断
    }
    res.status(500).json({ message: "コメントの削除に失敗しました" });
  } finally {
    if (session) {
      await session.endSession(); // セッションがある場合のみ終了
    }
  }
}

export { getAllLabs, searchLabs, getOneLab, createComment, deleteComment };
