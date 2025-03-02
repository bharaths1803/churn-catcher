import React, { useState } from "react";
import { Home, Settings, X } from "lucide-react";

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  return (
    <div
      className={`top-0 left-0 w-[20vw] bg-[#e7382e] p-10 text-white fixed h-full z-40  ease-in-out duration-300 ${
        showSidebar ? "translate-x-0 " : "-translate-x-full"
      }`}
    >
      <div className="w-full flex justify-end">
        <button
          className="text-black"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <X className="size-8" />
        </button>
      </div>
      <div className=" mt-10 h-full flex flex-col justify-between">
        <div className="w-full space-y-4">
          <div className="w-full flex items-center space-x-3 text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="25"
              height="25"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="black" />
              <rect
                x="10"
                y="14"
                width="4"
                height="6"
                fill="black"
                stroke="none"
              />
            </svg>

            <p>Home</p>
          </div>
          <div className="w-full flex items-center space-x-3 text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="black"
            >
              <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />
            </svg>

            <p>Dashboard</p>
          </div>
          <div className="w-full flex items-center space-x-3 text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="black"
            >
              <path d="M3 3v18h18v-2H5V3H3zm15.59 2.41L12 12.01l-2.59-2.6L7 12l5 5 9-9-2.41-2.59z" />
            </svg>

            <p>Strategies</p>
          </div>
          <div className="w-full flex items-center space-x-3 text-black">
            <Settings className="size-5" />
            <p>Settings</p>
          </div>
        </div>
        <div className="w-full flex items-end space-x-3 text-black mb-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="25"
            height="25"
            fill="black"
          >
            <path d="M10.09 15.59L12.67 18l5-5-5-5-2.58 2.41L14.17 12l-4.08 3.59zM4 4h8V2H4a2 2 0 00-2 2v16c0 1.1.9 2 2 2h8v-2H4V4z" />
          </svg>
          <p>Logout</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
