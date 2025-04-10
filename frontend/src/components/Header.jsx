import { Download, Home, LogIn, ShieldQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePredictStore } from "../store/usePredictStore";

const Header = () => {
  const navigate = useNavigate();
  const handleNavigateToHomePage = () => {
    navigate("/");
  };

  const { predictions } = usePredictStore();

  const fetchPDF = async () => {
    const response = await fetch("http://localhost:5000/get-pdf");
    const data = await response.json();
    const pdfData = `data:application/pdf;base64,${data.pdf_base64}`;
    window.open(pdfData, "_blank"); // Opens PDF in a new tab
  };

  const handleDownloadChurnedUsers = () => {
    const link = document.createElement("a");
    link.href = "http://localhost:5000/churned_users"; // Your backend URL
    link.setAttribute("download", "churned_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex justify-between h-12 shadow-md`}>
      <div className="flex space-x-4 pl-4 items-center">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:cursor-pointer hover:bg-black/70 px-4 py-2"
          onClick={handleNavigateToHomePage}
        >
          <Home size={18} />
          <span className="hidden md:inline">Home</span>
        </button>
      </div>
      {predictions && (
        <div className="flex space-x-4 pr-4 items-center">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white text-black hover:cursor-pointer hover:scale-110 transition-all duration-300 px-4 py-2"
            onClick={fetchPDF}
          >
            <ShieldQuestion size={18} />
            <span className="hidden md:inline">Generate Strategies</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:cursor-pointer hover:bg-black/70 px-4 py-2 "
            onClick={handleDownloadChurnedUsers}
          >
            <Download size={18} />
            <span className="hidden md:inline">Churned Users</span>
          </button>
        </div>
      )}
      {!predictions && (
        <div className="flex space-x-4 pl-4 pr-2 items-center">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white text-black hover:cursor-pointer hover:scale-110 transition-all duration-300 px-4 py-2">
            <LogIn size={18} />
            <span className="hidden md:inline">Login</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
