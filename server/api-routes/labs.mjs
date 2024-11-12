import express from "express";
import {
  getAllLabs,
  searchLabs,
  getOneLab,
  createComment,
  deleteComment,
} from "../controllers/labs.mjs";
const router = express.Router();

//api/labs
//全ての研究室情報の取得
router.get("/", getAllLabs);

//api/labs/search
//研究室検索API
//queryはgetリクエストで使用される
router.post("/search", searchLabs);

//api/labs/:id(lab)
//研究室の情報取得(コメント含む)
router.get("/:id", getOneLab);

//api/labs/:id(lab)(post)
//idの研究室にコメント追加
router.post("/:id", createComment);

//api/labs/:id(lab)(delete)
//idの研究室のコメント削除
router.delete("/:lab_id/comments/:comment_id/user/:user_id", deleteComment);

export default router;
