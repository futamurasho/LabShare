import express from "express";
import { getAllprofessor } from "../controllers/professor.mjs";
import Professor from "../models/professor.mjs";
import mongoose from "mongoose";

const router = express.Router();
//api/professor
//全ての研究室情報の取得
router.get("/", getAllprofessor);

export default router;
