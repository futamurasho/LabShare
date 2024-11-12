import mongoose, { Schema, model } from "mongoose";

const LabSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ["情報理工学専攻", "電気電子工学専攻"],
      required: true,
    },
    professor: {
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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment", // CommentSchemaを参照
      },
    ],
    like: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const Lab = mongoose.model("lab", LabSchema);
export default Lab;
