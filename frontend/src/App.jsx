import { Toaster } from "react-hot-toast";
import FileUploadPage from "./pages/FileUploadPage";
import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DummyPage from "./pages/DummyPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/file-upload" element={<FileUploadPage />} />
        <Route path="/dashboard/:pageNo" element={<DashboardPage />} />
        <Route path="/dummy" element={<DummyPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
