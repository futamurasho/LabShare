import apiClient from "./apiClient";
const ENDPOINT_URL = "/api/professor";

const professorApi = {
  //教員データ全取得
  async getAll() {
    const result = await apiClient.get(ENDPOINT_URL);
    return result.data;
  },
};

export default professorApi;
