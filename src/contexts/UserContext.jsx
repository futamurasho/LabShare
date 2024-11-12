import { useContext, createContext, useReducer, useEffect } from "react";
import apiClient from "../api/apiClient";

//ユーザ登録，ログインのコンテキスト
const userContext = createContext();
const userDispatchContext = createContext();

//他のファイルからstateを参照できる
const useUser = () => useContext(userContext);
const useDispatchUser = () => useContext(userDispatchContext);

//user(state)の一例↓
// const userInfo = {
//     id: _id,
//     username: username,
//     year: year,
//     likedLab: likedLab,
// };

const reducer = (state, action) => {
  switch (action.type) {
    case "user/login":
      return {
        ...state,
        ...action.state, // すべてのデータをマージしてstateに追加
      };
    case "user/register":
      return { ...action.state };
    case "user/like":
      return {
        ...state,
        likedLab: [...action.likedLab],
      };
    case "user/unlike":
      return {
        ...state,
        likedLab: [...action.likedLab],
      };
    case "user/logout":
      return {};
    default:
      return state;
  }
};

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    id: null,
    username: "",
    year: 0,
    likedLab: [],
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await apiClient.get("/api/users/me");
        dispatch({ type: "user/login", state: response.data });
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました", error);
        dispatch({ type: "user/logout" });
      }
    }
    fetchUser();
  }, []);

  return (
    <userContext.Provider value={state}>
      <userDispatchContext.Provider value={dispatch}>
        {children}
      </userDispatchContext.Provider>
    </userContext.Provider>
  );
};

export { useUser, useDispatchUser, UserProvider };
