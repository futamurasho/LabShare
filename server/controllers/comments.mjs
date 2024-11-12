import express from "express";
import Comment from "../models/comment.mjs";

async function updateComment(req, res) {
  const { content } = req.body;
  const comment_id = req.params.id;
  try {
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "コメントが見つかりません" });
    }
    if (content !== undefined) comment.content = content;
    await comment.save();
    res.status(200).json({ message: "コメントが更新された", comment });
  } catch (error) {
    res.status(500).json({ message: "コメントの更新に失敗しました" });
  }
}

async function plusGood(req, res) {
  const comment_id = req.params.id;
  const { user_id } = req.body;
  try {
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "コメントが見つかりません" });
    }
    if (comment.liked.includes(user_id)) {
      return res.status(400).json({ message: "これ以上いいねできません" });
    }
    //コメントlikedにuser_idを追加
    comment.liked.push(user_id);
    await comment.save();
    res.status(200).json({ message: "いいねが+1された", comment });
  } catch (error) {
    res.status(500).json({ message: "いいねの+1に失敗しました" });
  }
}

async function minusGood(req, res) {
  const comment_id = req.params.id;
  const { user_id } = req.body;
  try {
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "コメントが見つかりません" });
    }
    if (comment.liked.length > 0) {
      //コメントlikedからuser_idを削除
      comment.liked = comment.liked.filter(
        (id) => id.toString() !== user_id.toString()
      );
    } else {
      return res
        .status(400)
        .json({ message: "いいね数はこれ以上減らせません。" });
    }
    await comment.save();
    res.status(200).json({ message: "いいねが-1された", comment });
  } catch (error) {
    res.status(500).json({ message: "いいねの-1に失敗しました" });
  }
}

export { updateComment, plusGood, minusGood };
