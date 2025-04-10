import React, { useEffect, useState } from "react";
import { usePredictStore } from "../store/usePredictStore";
import { Download, Home, Settings, ShieldQuestion } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";

const DashboardPage = () => {
  const { predictions } = usePredictStore();
  const [animatedChurnPercentage, setAnimatedChurnPercentage] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [internationalData, setInternationalData] = useState([]);
  const [voicemailData, setVoicemailData] = useState([]);
  const [timespentData, setTimespentData] = useState([]);
  const [callscountData, setCallscountData] = useState([]);
  const { pageNo } = useParams();
  const navigate = useNavigate("/");

  const handleNavigateToNextPage = () => {
    const pageNumber = parseInt(pageNo);
    navigate(`/dashboard/${pageNumber + 1}`);
  };

  const handleNavigateToPreviousPage = () => {
    const pageNumber = parseInt(pageNo);
    navigate(`/dashboard/${pageNumber - 1}`);
  };

  const handleNavigateToFileUploadPage = () => {
    navigate("/");
  };

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

  useEffect(() => {
    if (predictions) {
      setTimeout(
        () => setAnimatedChurnPercentage(predictions["churn_percentage"]),
        100
      );

      const formattedData = Object.entries(
        predictions["state_wise_churn_counts"]
      ).map(([state, churn]) => ({
        state,
        churn,
      }));

      setChartData(formattedData);

      const formattedInternationalData = Object.entries(
        predictions["churn_by_international_plan"]
      ).map(([active, churn]) => ({
        active,
        churn,
      }));

      setInternationalData(formattedInternationalData);

      const formattedVoicemailData = Object.entries(
        predictions["churn_by_voicemail"]
      ).map(([active, churn]) => ({
        active,
        churn,
      }));

      setVoicemailData(formattedVoicemailData);

      const formattedTimespentData = Object.entries(
        predictions["churn_by_time_spent"]
      ).map(([category, churn]) => ({
        category,
        churn,
      }));

      setTimespentData(formattedTimespentData);

      const formattedCallscountData = Object.entries(
        predictions["churn_by_calls_count"]
      ).map(([category, churn]) => ({
        category,
        churn,
      }));

      setCallscountData(formattedCallscountData);
    }
  }, [predictions]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> */}
        <div className={`h-screen w-full ease-in-out duration-300`}>
          <Header />
          {pageNo === "1" && (
            <div
              className={`h-screen w-full ${
                showSidebar ? "translate-x-[20vw]" : "translate-x-0"
              } ease-in-out duration-300 flex flex-col mt-2`}
            >
              <div className="overflow-hidden p-2 h-full bg-[#f8f8f8] relative">
                <button
                  className="fixed right-4 top-72 z-50 hover:scale-125 hover:cursor-pointer ease-in-out duration-300"
                  onClick={handleNavigateToNextPage}
                >
                  <img src="/arrow-right.png" width={25} height={25} />
                </button>
                <div className="w-full space-y-4">
                  <h1 className="font-bold text-3xl">
                    Customer Churn Overview
                  </h1>
                  <p className="font-medium text-lg">
                    Churn Rate: {predictions["churn_percentage"]}%
                  </p>
                  <p className="text-lg font-semibold">
                    Customer Retention Metrics
                  </p>
                  <div className="bg-white shadow-md w-100 rounded-md">
                    <div className="w-102 space-y-3 p-4">
                      <p>Churn Risk: {predictions["churn_risk"]}</p>
                      <div className="h-7 rounded-full bg-[#f3f3f3] mr-2 overflow-hidden">
                        <div
                          className={`h-7 bg-red-400 rounded-full transition-transform duration-500 ease-in-out`}
                          style={{
                            transform: `translateX(${
                              animatedChurnPercentage - 100
                            }%)`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-md h-96 rounded-md p-3 space-y-4">
                    <h3 className="text-lg">State-wise Churn Predictions</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="state" tick={{ fontSize: 12 }}></XAxis>
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="churn"
                          fill="#e7382e"
                          barSize={20}
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          {pageNo === "2" && (
            <div
              className={`h-screen w-full ${
                showSidebar ? "translate-x-[20vw]" : "translate-x-0"
              } ease-in-out duration-300 flex flex-col mt-2`}
            >
              <div className="overflow-hidden p-2 h-full bg-[#f8f8f8] relative">
                <button
                  className="fixed left-4 top-72 z-50 rotate-180 hover:scale-125 ease-in-out duration-300 hover:cursor-pointer"
                  onClick={handleNavigateToPreviousPage}
                >
                  <img src="/arrow-right.png" width={25} height={25} />
                </button>
                <button
                  className="fixed right-4 top-72 z-50 hover:scale-125 ease-in-out duration-300 hover:cursor-pointer"
                  onClick={handleNavigateToNextPage}
                >
                  <img src="/arrow-right.png" width={25} height={25} />
                </button>
                <div className="w-full space-y-4 grid grid-cols-2">
                  <div className="flex flex-col items-center space-y-44">
                    <div className="bg-white shadow-md w-100 rounded-md">
                      <div className="w-102 space-y-4 p-4">
                        <p className="font-semibold text-lg">
                          Customer Segmentation
                        </p>
                        <div className="w-full flex justify-between">
                          <div className="space-y-3">
                            <p>High</p>
                            <p>
                              {
                                predictions["customer_segmentation"][
                                  "High Risk"
                                ]
                              }
                              %
                            </p>
                          </div>
                          <div className="space-y-3">
                            <p>Medium</p>
                            <p>
                              {
                                predictions["customer_segmentation"][
                                  "Medium Risk"
                                ]
                              }
                              %
                            </p>
                          </div>
                          <div className="space-y-3">
                            <p>Low</p>
                            <p>
                              {predictions["customer_segmentation"]["Low Risk"]}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white shadow-md w-100 rounded-md">
                      <div className="w-102 space-y-5 p-4">
                        <p className="font-semibold text-3xl text-center">
                          Potential Revenue Loss
                        </p>
                        <p className="text-center">
                          Rs. {predictions["potential_revenue_loss"]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white shadow-md w-100 rounded-md">
                    <p className="font-semibold text-center">
                      Factors Affecting Churn
                    </p>
                    <div className="w-full flex flex-col flex-grow space-y-3 p-4 overflow-y-auto max-h-[85vh] no-scrollbar">
                      {predictions["feature_importance"].map((val, idx) => (
                        <ProgressBar
                          value={Math.min(val["importance"], 100)}
                          text={val["feature"]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {pageNo === "3" && (
            <div
              className={`h-screen w-full ${
                showSidebar ? "translate-x-[20vw]" : "translate-x-0"
              } ease-in-out duration-300 flex flex-col mt-2`}
            >
              <div className="overflow-hidden p-2 h-full bg-[#f8f8f8] relative">
                <button
                  className="fixed left-4 top-72 z-50 rotate-180 hover:scale-125 ease-in-out duration-300 hover:cursor-pointer"
                  onClick={handleNavigateToPreviousPage}
                >
                  <img src="/arrow-right.png" width={25} height={25} />
                </button>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div className="w-full space-y-4">
                    <div className="bg-white shadow-md h-72 rounded-md p-3 space-y-4">
                      <h3 className="text-lg">International Plan And Churn</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={internationalData}>
                          <XAxis
                            dataKey="active"
                            tick={{ fontSize: 12 }}
                          ></XAxis>
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="churn"
                            fill="#e7382e"
                            barSize={20}
                            radius={[10, 10, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white shadow-md h-72 rounded-md p-3 space-y-4">
                      <h3 className="text-lg">Voicemail Plan And Churn</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={voicemailData}>
                          <XAxis
                            dataKey="active"
                            tick={{ fontSize: 12 }}
                          ></XAxis>
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="churn"
                            fill="#e7382e"
                            barSize={20}
                            radius={[10, 10, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="bg-white shadow-md h-72 rounded-md p-3 space-y-4">
                      <h3 className="text-lg">Total Time spent And Churn</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={timespentData}>
                          <XAxis
                            dataKey="category"
                            tick={{ fontSize: 12 }}
                          ></XAxis>
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="churn"
                            fill="#e7382e"
                            barSize={20}
                            radius={[10, 10, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white shadow-md h-72 rounded-md p-3 space-y-4">
                      <h3 className="text-lg">Total calls made And Churn</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={callscountData}>
                          <XAxis
                            dataKey="category"
                            tick={{ fontSize: 12 }}
                          ></XAxis>
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="churn"
                            fill="#e7382e"
                            barSize={20}
                            radius={[10, 10, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ProgressBar = ({ value, text }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimatedValue(value), 100);
  }, [value]);

  const capitalizeText = (text) => {
    return text
      .split(" ") // Splitting by sentence-ending punctuation
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <div>
      <div>{capitalizeText(text)}</div>
      <div className="h-7 rounded-full bg-[#f3f3f3] mr-2 overflow-hidden">
        <div
          className={`h-7 bg-red-400 rounded-full transition-transform duration-500 ease-in-out`}
          style={{
            transform: `translateX(${animatedValue - 100}%)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default DashboardPage;

/* 
                {predictions && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Response:</h3>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                )}
*/
