import Professor from "../models/professor.mjs";

//教授情報取得
async function getAllprofessor(req, res) {
  try {
    const professors = await Professor.find();
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({
      message: "全ての教員情報取得に失敗しました",
      error,
    });
  }
}

export { getAllprofessor };
