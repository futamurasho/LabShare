import apiClient from "./apiClient";
const ENDPOINT_URL = "/api/labs";

const labApi = {
  //idの研究室データを取得
  async get(lab_id) {
    const result = await apiClient.get(ENDPOINT_URL + "/" + lab_id);
    return result.data;
  },

  //全ての研究室データを取得
  async getAll() {
    const result = await apiClient.get(ENDPOINT_URL);
    return result.data;
  },

  //コメントの追加(result.dataにはコメントの情報)
  async addComment(lab_id, content, user_id) {
    const data = {
      content: content,
      user_id: user_id,
    };
    const result = await apiClient.post(ENDPOINT_URL + "/" + lab_id, data);
    return result.data.comment;
  },
  //コメントの削除(result.dataには「"message": "コメントが削除されました"」のみ)
  async deleteComment(lab_id, comment_id, user_id) {
    const result = await apiClient.delete(
      ENDPOINT_URL +
        "/" +
        lab_id +
        "/comments/" +
        comment_id +
        "/user/" +
        user_id
    );
    return result.data;
  },

  //研究室の検索(result.dataには検索された研究室の情報)
  async searchLab(data) {
    const result = await apiClient.post(ENDPOINT_URL + "/search", data);

    return result.data;
  },
};

export default labApi;
