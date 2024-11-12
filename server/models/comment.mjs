import mongoose, { Schema, model } from "mongoose";
const CommentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId, // LabSchemaのIDを参照
      ref: "lab",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // CommentSchemaを参照
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("comment", CommentSchema);
export default Comment;
