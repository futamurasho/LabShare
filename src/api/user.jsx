import apiClient from "./apiClient";

const ENDPOINT_URL = "/api/users";

const userApi = {
  //ユーザ登録()
  async register(user) {
    const result = await apiClient.post(ENDPOINT_URL + "/register", user);
    return result.data.user;
  },
  //
  async login(user) {
    const result = await apiClient.post(ENDPOINT_URL + "/login", user);
    return result.data.user;
  },

  async logout() {
    const result = await apiClient.post(ENDPOINT_URL + "/logout");
    return result.data.message;
  },

  //お気に入りを登録(result.dataにはmessage,ユーザのlikedlabが格納)
  async likeLab(user_id, lab_id) {
    const data = { user_id: user_id, lab_id: lab_id };
    const result = await apiClient.post(ENDPOINT_URL, data);
    return result.data;
  },

  //お気に入りを解除(result.dataにはmessage,ユーザのlikedlabが格納)
  async unlikeLab(user_id, lab_id) {
    const data = { user_id: user_id, lab_id: lab_id };
    const result = await apiClient.patch(ENDPOINT_URL, data);
    return result.data;
  },
};

export default userApi;
