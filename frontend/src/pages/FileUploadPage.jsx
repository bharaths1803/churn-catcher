import { useRef, useState } from "react";
import { usePredictStore } from "../store/usePredictStore";
import Sidebar from "../components/Sidebar";
import {
  Download,
  Home,
  Loader,
  Menu,
  Settings,
  ShieldQuestion,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FileFormat from "../components/FileFormat";

const FileUploadPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { isPredicting, predict, predictions } = usePredictStore();
  const fileUploadInputRef = useRef();
  const navigate = useNavigate();

  const handleFileUploadButtonClick = () => {
    if (fileUploadInputRef && fileUploadInputRef.current) {
      fileUploadInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
      console.log("Before pred");
      await predict(formData);
      console.log("After pred");
      navigate("/dashboard/1");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "http://localhost:5000/sample-format"; // Your backend URL
    link.setAttribute("download", "sample_format.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {showModal && <FileFormat setShowModal={setShowModal} />}

      <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#f8f8f">
        {/* <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> */}
        <div className={` h-screen w-full ease-in-out duration-300`}>
          {!showModal && <Header />}
          <div
            className={`h-screen w-full ${
              showSidebar ? "translate-x-[20vw]" : "translate-x-0"
            } ease-in-out duration-300 flex flex-col`}
          >
            <h1
              className={`font-bold text-4xl text-2 mt-10 ${
                showSidebar ? "ml-[420px]" : "flex flex-col items-center"
              } ease-in-out duration-300 text-black/60`}
            >
              UPLOAD CSV FILE
            </h1>
            <p
              className={`text-2xl text-2 mt-5 ${
                showSidebar ? "ml-60" : "flex flex-col items-center"
              } ease-in-out duration-300`}
            >
              Get Customer Churn in minutes and apply retention strategies
            </p>
            <input
              className="hidden"
              type="file"
              ref={fileUploadInputRef}
              onChange={handleFileChange}
              accept=".csv"
            />
            <div
              className={`mt-10 ${
                showSidebar ? "ml-96" : "flex flex-col items-center"
              }`}
            >
              <button
                className={`bg-green-500 hover:bg-green-600 hover:cursor-pointer ease-in-out duration-300 w-sm rounded-lg h-15 shadow-md text-white text-2xl`}
                onClick={handleFileUploadButtonClick}
              >
                {isPredicting ? (
                  <div className="flex justify-center items-center">
                    <Loader className="animate-spin" />
                  </div>
                ) : (
                  "Select CSV File"
                )}
              </button>
            </div>

            <div
              className={`mt-10 ${
                showSidebar ? "ml-96" : "flex flex-col items-center"
              }`}
            >
              <button
                className={`bg-[#e7382e] hover:bg-amber-800 hover:cursor-pointer ease-in-out duration-300 w-sm rounded-lg h-15 shadow-md text-white text-2xl`}
                onClick={handleDownload}
              >
                Download Sample Format
              </button>
            </div>

            <div
              className={`mt-10 ${
                showSidebar ? "ml-96" : "flex flex-col items-center"
              }`}
            >
              <button
                className={`bg-gray-600 hover:bg-gray-700 hover:cursor-pointer ease-in-out duration-300 w-sm rounded-lg h-15 shadow-md text-white text-2xl`}
                onClick={() => setShowModal(true)}
              >
                View Data Description
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUploadPage;
