import express from "express";
import {
  updateComment,
  plusGood,
  minusGood,
} from "../controllers/comments.mjs";
const router = express.Router();

//api/comments/:id(comment)
//コメント内容更新
router.patch("/:id", updateComment);

//api/comments/:id(comment)/like
//コメントのいいね数変更(likedのリストにuser_id格納でリストの長さでいいね数増やす)
router.patch("/:id/like", plusGood);

//api/comments/:id(comment)/unlike
//コメントのいいね数変更(likedのリストにuser_id削除でリストの長さでいいね数減らす)
router.patch("/:id/unlike", minusGood);

export default router;
