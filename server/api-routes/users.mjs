import express from "express";

import {
  likeLab,
  unlikeLab,
  registerUser,
  loginUser,
  logout,
  firstGet,
} from "../controllers/users.mjs";
import authenticateToken from "../helpers/token.mjs";

const router = express.Router();

//お気に入り研究室を追加
router.post("/", likeLab);

//お気に入り研究室を削除
router.patch("/", unlikeLab);

//ユーザ登録
router.post("/register", registerUser);

// ユーザログイン
router.post("/login", loginUser);

//ユーザログアウト
router.post("/logout", logout);

//ユーザトークン取得
router.get("/me", authenticateToken, firstGet);

export default router;
