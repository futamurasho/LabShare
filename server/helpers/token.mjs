// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Cookieからトークンを取得

  if (!token) {
    return res.status(401).json({ message: "認証トークンが見つかりません。" });
  }

  try {
    const decoded = jwt.verify(token, process.env.your_secret_key);
    req.user = decoded; // デコードしたユーザー情報をリクエストに保存
    next();
  } catch (error) {
    res.status(403).json({ message: "トークンが無効です。" });
  }
};

export default authenticateToken;
