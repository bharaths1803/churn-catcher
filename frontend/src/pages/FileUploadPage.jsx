import { useRef, useState } from "react";
import { usePredictStore } from "../store/usePredictStore";
import Sidebar from "../components/Sidebar";
import { Home, Loader, Menu, Settings, ShieldQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FileUploadPage = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { isPredicting, predict, predictions } = usePredictStore();
  const [file, setFile] = useState();
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
      await predict(formData);
      if (predictions) {
        navigate("/dashboard/1");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#f8f8f">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className={` h-screen w-full ease-in-out duration-300`}>
        <div
          className={`${
            showSidebar ? "justify-end" : "justify-between"
          } h-12 shadow-md flex`}
        >
          {!showSidebar && (
            <button
              className="pl-2 hover:cursor-pointer"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="size-7" />
            </button>
          )}
          <div className="flex space-x-4 pr-4 items-center">
            <button>
              <Home className="size-5" />
            </button>
            <button>
              <ShieldQuestion className="size-5" />
            </button>
            <button>
              <Settings className="size-5" />
            </button>
            <button className="rounded-lg bg-gray-100 h-10 w-10 flex justify-center items-center">
              <img src="/vite.svg" className="object-cover" />
            </button>
          </div>
        </div>
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
              className={`bg-[#e7382e] hover:bg-amber-800 hover:cursor-pointer ease-in-out duration-300 w-sm rounded-lg h-15 shadow-md text-white text-2xl`}
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
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
