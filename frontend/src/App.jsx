import { Toaster } from "react-hot-toast";
import FileUploadPage from "./pages/FileUploadPage";
import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DummyPage from "./pages/DummyPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FileUploadPage />} />
        <Route path="/dashboard/:pageNo" element={<DashboardPage />} />
        <Route path="/dummy" element={<DummyPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
