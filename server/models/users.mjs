import { Schema, model } from "mongoose";

const UserSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      require: true,
      enum: [1, 2, 3],
    },
    likedLab: [
      {
        type: Schema.Types.ObjectId,
        ref: "lab", // LabSchemaを参照
      },
    ],
  },
  { timestamps: true }
);

const User = model("user", UserSchema);
export default User;
