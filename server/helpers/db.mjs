import mongoose from "mongoose";
import env from "dotenv";
env.config();

mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGO_URI);
