import apiClient from "./apiClient";

const ENDPOINT_URL = "/api/comments";

const commentApi = {
  //
  async updateComment(comment_id, content) {
    const result = await apiClient.patch(
      ENDPOINT_URL + "/" + comment_id,
      content
    );
    return result.data;
  },

  //コメントにいいねをつける(result.dataにはmessageと,コメントの内容が出力，いいねができなければ，messageのみ)
  async likeComment(comment_id, user_id) {
    const result = await apiClient.patch(
      ENDPOINT_URL + "/" + comment_id + "/like",
      { user_id }
    );
    console.log(result);
    return result.data.comment;
  },

  //コメントのいいねを消す(result.dataにはmessageと,コメントの内容が出力，いいね消去ができなければ，messageのみ)
  async unlikeComment(comment_id, user_id) {
    const result = await apiClient.patch(
      ENDPOINT_URL + "/" + comment_id + "/unlike",
      { user_id }
    );
    return result.data.comment;
  },
};

export default commentApi;
