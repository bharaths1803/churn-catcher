import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
  Notebook,
  TrendingUpDown,
  File,
  View,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const featuresData = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Advanced Analytics",
      description: "Get detailed insights into your customer churning patterns",
    },
    {
      icon: <Notebook className="h-8 w-8 text-blue-600" />,
      title: "Retention Strategies",
      description:
        "Get customer retention strategies for low, medium, and high risk customers using AI technology",
    },
    {
      icon: <TrendingUpDown className="h-8 w-8 text-blue-600" />,
      title: "Predictions",
      description: "Accurate churn predictions using machine learning",
    },
  ];

  const howItWorksData = [
    {
      icon: <File className="h-8 w-8 text-blue-600" />,
      title: "1. Upload customer data",
      description: "Upload the customer data in CSV format",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "2. View churn analytics",
      description: "View graphs of feature specific segmentation and analysis",
    },
    {
      icon: <View className="h-8 w-8 text-blue-600" />,
      title: "3. Get Strategies",
      description: "Download AI powered retention strategies ",
    },
  ];

  const handleNavigate = (page) => {
    navigate(page);
  };

  return (
    <div className="mt-10">
      <HeroSection />

      <section className="py-20 bg-blue-50">
        <div className="mx-auto container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <p className="text-gray-600 leading-10">
              <h1 className="text-5xl text-black mb-4 text-center md:text-left">
                Upload Your Customer Data
              </h1>
              Upload a CSV file containing your customer records to begin churn
              analysis. Make sure your file follows the required format with all
              necessary columns. The supported format is .csv. Your file will be
              instantly validated upon upload. Your data remains secure and
              private — it is never stored permanently. Start by uploading your
              file to get predictions and insights.
            </p>
            <div className="hero-image-wrapper">
              <div className="tilt-image">
                <img
                  src={"/file-upload.png"}
                  alt="File upload cover image"
                  width={1280}
                  height={720}
                  className="rounded-lg mx-auto shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="hero-image-wrapper">
              <div className="tilt-image-right">
                <img
                  src={"/feature-specific-prediction.png"}
                  alt="Feature speicic cover image"
                  width={1280}
                  height={720}
                  className="rounded-lg mx-auto shadow-2xl"
                  priority
                />
              </div>
            </div>
            <p className="text-gray-600 leading-10">
              <h1 className="text-5xl text-black mb-4 text-center md:text-left">
                Feature Specific Insights
              </h1>
              Get instant churn predictions for specific customer features.
              Ideal for testing individual scenarios, this tool helps you
              understand how certain attributes influence churn risk.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="mx-auto container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <p className="text-gray-600 leading-10">
              <h1 className="text-5xl text-black mb-4 text-center md:text-left">
                View Statistics
              </h1>
              Explore detailed churn analytics including overall churn rate,
              customer risk segmentation, usage patterns, revenue impact, and
              key churn factors. Gain actionable insights to understand trends
              and drive smarter retention strategies.
            </p>
            <div className="hero-image-wrapper">
              <div className="tilt-image">
                <img
                  src={"/statistics.png"}
                  alt="File upload cover image"
                  width={1280}
                  height={720}
                  className="rounded-lg mx-auto shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="hero-image-wrapper">
              <div className="tilt-image-right">
                <img
                  src={"/ai-strategies.png"}
                  alt="Feature speicic cover image"
                  width={1280}
                  height={720}
                  className="rounded-lg mx-auto shadow-2xl"
                  priority
                />
              </div>
            </div>
            <p className="text-gray-600 leading-10">
              <h1 className="text-5xl text-black mb-4 text-center md:text-left">
                AI Powered Retention Strategies
              </h1>
              Download a personalized PDF containing AI-generated retention
              strategies tailored to your data. Based on your churn insights,
              this document outlines targeted action plans for high, medium, and
              low-risk customer segments—helping you reduce churn and improve
              customer loyalty with data-driven decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to retain your customer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, idx) => (
              <div key={idx} className="p-6">
                <div className="space-y-4 pt-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="mx-auto container px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((data, idx) => (
              <div key={idx} className="text-center">
                <div className="w-10 h-16 flex items-center rounded-full justify-center mb-8 mx-auto">
                  {data.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{data.title}</h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 ">
        <div className="mx-auto container px-4 text-center">
          <h2 className="text-3xl font-bold text-center mb-7">
            Ready to Take action against churn?
          </h2>
          <button
            className={
              "px-8 rounded-lg py-3 border bg-[#eb6059] hover:opacity-75 active:opacity-50 text-white hover:cursor-pointer animate-bounce"
            }
            onClick={() => handleNavigate("/file-upload")}
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
