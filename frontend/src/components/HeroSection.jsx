import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  Home,
  Settings,
  ShieldQuestion,
  ShieldQuestionIcon,
} from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollThreshold = 100;
      const scrollPosition = window.scrollY;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (page) => {
    navigate(page);
  };

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-8 gradient gradient-text">
          Retain Your Customers <br /> with Intelligence
        </h1>
        <p className="mx-auto text-xl text-gray-600 mb-8 max-w-2xl mt-2">
          An AI-powered churn prediction platform that helps you view, analyse,
          and enahnce your retention strategies with real-time insights
        </p>
        <div className="flex justify-center space-x-4">
          <button
            className={
              "px-8 rounded-lg py-3 border bg-[#eb6059] hover:opacity-75 active:opacity-50 text-white hover:cursor-pointer"
            }
            onClick={() => handleNavigate("/file-upload")}
          >
            Get started
          </button>
          <button
            className={
              "px-8 rounded-lg py-3 border bg-[#eb6059] hover:opacity-75 active:opacity-50 text-white hover:cursor-pointer"
            }
            onClick={() => handleNavigate("/login")}
          >
            Login
          </button>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image" ref={imageRef}>
            <img
              src={"/landing-banner.png"}
              alt="Welth cover image"
              width={1280}
              height={720}
              className="rounded-lg mx-auto shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
