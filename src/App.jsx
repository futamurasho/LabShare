import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LabProvider } from "./contexts/LabContext";
import { UserProvider } from "./contexts/UserContext";
import Login from "./pages/LoginPage/Login";
import Register from "./pages/RegisterPage/register";
import Lab from "./pages/LabPage/Lab";
import Labs from "./pages/LabsPage/Labs";
import Graph from "./pages/GraphPage/Graph";
import Page404 from "./pages/Page404";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <LabProvider>
          <div className="container">
            <Routes>
              <Route path="/" element={<Labs />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/Lab/:id" element={<Lab />} />
              <Route path="/*" element={<Page404 />} />
            </Routes>
          </div>
        </LabProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
export default App;
