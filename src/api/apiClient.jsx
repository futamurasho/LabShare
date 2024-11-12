// apiClient.js
import axios from "axios";

//Cookieを含むリクエストを許可
const apiClient = axios.create({ withCredentials: true });

// インターセプターを設定（エラーハンドリングなど）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(
      error.response?.data?.message || "時間をおいてお試しください。"
    );
  }
);

export default apiClient;
