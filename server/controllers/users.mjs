import express from "express";
import User from "../models/users.mjs";
import Lab from "../models/labs.mjs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();

// async function likeLab(req, res) {
//   const { user_id, lab_id } = req.body;
//   try {
//     const user = await User.findById(user_id);
//     if (!user) {
//       return res.status(404).json({ message: "ユーザが見つかりません" });
//     }
//     // 既にお気に入りに追加されていないか確認
//     if (user.likedLab.includes(lab_id)) {
//       return res
//         .status(400)
//         .json({ message: "既にお気に入りに追加されています。" });
//     }

//     // lab_idをお気に入りリストに追加
//     user.likedLab.push(lab_id);
//     await user.save();
//     res
//       .status(200)
//       .json({ message: "お気に入りに追加されました", likedLab: user.likedLab });
//   } catch (error) {
//     res.status(500).json({ message: "お気に入りの追加に失敗しました" });
//   }
// }

async function likeLab(req, res) {
  const { user_id, lab_id } = req.body;
  let session;
  try {
    //複数の操作を行うため，トランザクションセッションを開始
    session = await mongoose.startSession();
    session.startTransaction();
    const user = await User.findById(user_id);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "ユーザが見つかりません" });
    }
    // 既にお気に入りに追加されていないか確認
    if (user.likedLab.includes(lab_id)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "既にお気に入りに追加されています。" });
    }

    // lab_idをお気に入りリストに追加
    user.likedLab.push(lab_id);
    await user.save({ session });

    // lab_idに合致する研究室を探し、likeを1増加
    const lab = await Lab.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ message: "研究室が見つかりません" });
    }

    lab.like += 1; // likeを1増加
    await lab.save({ session }); // session付きで保存

    // 成功したらトランザクションをコミットして，レスポンスを返す
    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "お気に入りに追加されました", likedLab: user.likedLab });
  } catch (error) {
    if (session) {
      await session.abortTransaction(); // セッションがある場合のみトランザクションを中断
    }
    res.status(500).json({ message: "お気に入りの追加に失敗しました", error });
  } finally {
    if (session) {
      await session.endSession(); // セッションがある場合のみ終了
    }
  }
}

// async function unlikeLab(req, res) {
//   const { user_id, lab_id } = req.body;
//   try {
//     const user = await User.findById(user_id);
//     if (!user) {
//       return res.status(404).json({ message: "ユーザが見つかりません" });
//     }
//     user.likedLab = user.likedLab.filter((id) => id.toString() !== lab_id);
//     await user.save();
//     res.status(200).json({
//       message: "お気に入りから削除されました",
//       likedLab: user.likedLab,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "お気に入りの削除に失敗しました" });
//   }
// }

async function unlikeLab(req, res) {
  const { user_id, lab_id } = req.body;
  let session;
  try {
    //複数の操作を行うため，トランザクションセッションを開始
    session = await mongoose.startSession();
    session.startTransaction();
    const user = await User.findById(user_id);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "ユーザが見つかりません" });
    }
    user.likedLab = user.likedLab.filter((id) => id.toString() !== lab_id);
    await user.save({ session });

    // lab_idに合致する研究室を探し、likeを1増加
    const lab = await Lab.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ message: "研究室が見つかりません" });
    }

    lab.like -= 1; // likeを1増加
    await lab.save({ session }); // session付きで保存

    // 成功したらトランザクションをコミットして，レスポンスを返す
    await session.commitTransaction();
    res.status(200).json({
      message: "お気に入りから削除されました",
      likedLab: user.likedLab,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction(); // セッションがある場合のみトランザクションを中断
    }
    res.status(500).json({ message: "お気に入りの削除に失敗しました", error });
  } finally {
    if (session) {
      await session.endSession(); // セッションがある場合のみ終了
    }
  }
}

async function registerUser(req, res) {
  const { username, email, password, year } = req.body;

  // 入力値の検証
  if (!username || !email || !password || !year) {
    return res
      .status(400)
      .json({ message: "すべてのフィールドを入力してください。" });
  }

  try {
    const existeduser = await User.findOne({ username: username });
    if (existeduser) {
      return res.status(400).json({ message: "そのユーザ名は使用できません" });
    }
    const existedemail = await User.findOne({ email: email });
    if (existedemail) {
      return res
        .status(400)
        .json({ message: "そのメールアドレスは使用できません" });
    }
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      year,
      likedLab: [],
    });
    // ユーザーを保存
    const savedUser = await newUser.save();

    // JWTトークンを生成
    const token = jwt.sign(
      {
        id: savedUser._id,
        username: savedUser.username,
        year: savedUser.year,
        likedLab: savedUser.likedLab,
      },
      process.env.your_secret_key, // セキュリティキー
      { expiresIn: "1h" } // トークンの有効期限
    );

    //渡すユーザ情報
    const userInfo = {
      id: savedUser._id,
      username: savedUser.username,
      year: savedUser.year,
      likedLab: savedUser.likedLab,
    };

    // トークンをHTTP-Only Cookieにセット
    res.cookie("token", token, {
      httpOnly: true, // JavaScriptからアクセス不可
      secure: process.env.NODE_ENV === "production", // https接続のみ
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1時間有効
    });

    // 登録成功時にユーザー情報(id,name,year,likedLab)を返す
    res
      .status(201)
      .json({ message: "ユーザー登録が成功しました。", user: userInfo });
  } catch (error) {
    res.status(500).json({ message: "ユーザー登録に失敗しました。" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  // ユーザ名とパスワードが入力されているか確認
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "ユーザー名とパスワードを入力してください。" });
  }

  try {
    // ユーザー名でユーザーを検索
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // パスワードを確認
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "パスワードが正しくありません。" });
    }

    // JWTトークンを生成
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        year: user.year,
        likedLab: user.likedLab,
      },
      process.env.your_secret_key, // セキュリティキー
      { expiresIn: "1h" } // トークンの有効期限
    );

    const userInfo = {
      id: user._id,
      username: user.username,
      year: user.year,
      likedLab: user.likedLab,
    };

    // トークンをHTTP-Only Cookieにセット
    res.cookie("token", token, {
      httpOnly: true, // JavaScriptからアクセス不可
      secure: process.env.NODE_ENV === "production", // https接続のみ
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1時間有効
    });

    // ログイン成功時にユーザー情報(id,name,year,likedLab)を返す
    res.status(200).json({ message: "ログイン成功", user: userInfo });
  } catch (error) {
    res.status(500).json({ message: "ログインに失敗しました。" });
  }
}

function logout(req, res) {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "ログアウトしました" });
}

async function firstGet(req, res) {
  // ミドルウェアを通過した時点で req.user にユーザー情報がある
  try {
    const user = await User.findById(req.user.id); // データベースからユーザー情報を取得
    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }
    res.json({
      id: user._id,
      username: user.username,
      year: user.year,
      likedLab: user.likedLab,
    });
  } catch (error) {
    res.status(500).json({ message: "ユーザー情報の取得に失敗しました。" });
  }
}

export { likeLab, unlikeLab, registerUser, loginUser, logout, firstGet };
