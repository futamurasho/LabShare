import { useEffect, useContext, createContext, useReducer } from "react";
import labApi from "../api/labs"; // 研究室情報を取得するAPIをインポート

//研究室の追加・更新・削除・初期化のコンテキスト
const LabContext = createContext();
const LabDispatchContext = createContext();

// 他のファイルからstateを参照できるようにエクスポート
const useLabs = () => useContext(LabContext);
const useDispatchLabs = () => useContext(LabDispatchContext);

const reducer = (labs, action) => {
  switch (action.type) {
    case "lab/init":
      return [...action.labs];

    case "lab/update":
      const updatedLabs = labs.filter((_lab) => _lab._id !== action.lab._id);
      updatedLabs.unshift(action.lab);
      return updatedLabs;

    default:
      return labs;
  }
};

const LabProvider = ({ children }) => {
  const [labs, dispatch] = useReducer(reducer, []);

  // 初期化：APIから研究室データを取得
  useEffect(() => {
    labApi.getAll().then((_labs) => {
      dispatch({ type: "lab/init", labs: _labs });
    });
  }, []);

  return (
    <LabContext.Provider value={labs}>
      <LabDispatchContext.Provider value={dispatch}>
        {children}
      </LabDispatchContext.Provider>
    </LabContext.Provider>
  );
};

export { useLabs, useDispatchLabs, LabProvider };
