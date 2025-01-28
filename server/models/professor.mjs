import mongoose, { Schema, model } from "mongoose";

const ProfessorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lab: {
      type: String,
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId, // Labスキーマへの参照
      ref: "lab",
      required: true,
    },
    keywords: {
      type: Array,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    keywords: {
      type: Array,
      required: true,
    },
    topic_distribution: {
      type: [Number], // トピック分布のリスト
      required: true,
    },
    similarities: [
      {
        name: { type: String, required: true }, // 他の教授名
        similarity: { type: Number, required: true }, // cos類似度
      },
    ],
  },
  { timestamps: true }
);
const Professor = mongoose.model("professor", ProfessorSchema);
export default Professor;
