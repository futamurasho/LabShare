import express from "express";
import labsRouter from "./labs.mjs";
import usersRouter from "./users.mjs";
import commentsRouter from "./comments.mjs";

const router = express.Router();
router.use("/labs", labsRouter);
router.use("/users", usersRouter);
router.use("/comments", commentsRouter);

export default router;
